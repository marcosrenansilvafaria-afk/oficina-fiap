locals {
  database_url = "postgresql://${var.db_user}:${var.db_password}@postgres.${var.namespace}.svc.cluster.local:5432/${var.db_name}"
}

# ── 00-namespaces ───────────────────────────────────────────────────────────
resource "kubectl_manifest" "namespace" {
  yaml_body  = file("${path.module}/manifests/00-namespaces/namespace.yaml")
  depends_on = [kind_cluster.oficina]
}

# ── 01-config ───────────────────────────────────────────────────────────────
resource "kubectl_manifest" "configmap" {
  yaml_body  = file("${path.module}/manifests/01-config/configmap.yaml")
  depends_on = [kubectl_manifest.namespace]
}

resource "kubectl_manifest" "api_secret" {
  yaml_body = templatefile("${path.module}/manifests/01-config/secret.tpl.yaml", {
    database_url           = local.database_url
    jwt_secret             = var.jwt_secret
    external_webhook_token = var.external_webhook_token
  })
  sensitive_fields = [
    "stringData.DATABASE_URL",
    "stringData.JWT_SECRET",
    "stringData.EXTERNAL_WEBHOOK_TOKEN",
  ]
  depends_on = [kubectl_manifest.namespace]
}

# ── 02-app ──────────────────────────────────────────────────────────────────
resource "kubectl_manifest" "api_service_clusterip" {
  yaml_body  = file("${path.module}/manifests/02-app/service-clusterip.yaml")
  depends_on = [kubectl_manifest.namespace]
}

resource "kubectl_manifest" "api_service_nodeport" {
  yaml_body  = file("${path.module}/manifests/02-app/service-nodeport.yaml")
  depends_on = [kubectl_manifest.namespace]
}

# wait_for_rollout = false: o provider apenas submete o Job ao cluster.
# A conclusão real do Job é verificada no CI via "kubectl wait --for=condition=complete".
resource "kubectl_manifest" "migrate_job" {
  yaml_body = templatefile("${path.module}/manifests/02-app/migrate-job.tpl.yaml", {
    image_tag         = var.image_tag
    image_registry    = var.image_registry
    image_pull_policy = var.image_pull_policy
  })
  wait_for_rollout = false
  depends_on = [
    kubectl_manifest.configmap,
    kubectl_manifest.api_secret,
    kubernetes_deployment.postgres,
    kubernetes_service.postgres,
  ]
}

# wait_for_rollout = false: o rollout é verificado no CI via "kubectl rollout status".
# Isso evita o timeout de 10 min do provider enquanto a API aguarda a migration.
resource "kubectl_manifest" "api_deployment" {
  yaml_body = templatefile("${path.module}/manifests/02-app/deployment.tpl.yaml", {
    image_tag         = var.image_tag
    image_registry    = var.image_registry
    image_pull_policy = var.image_pull_policy
  })
  wait_for_rollout = false
  depends_on       = [kubectl_manifest.migrate_job]
}

# wait_for_rollout = false: o HPA não tem condição "Ready" — só precisa existir.
resource "kubectl_manifest" "api_hpa" {
  yaml_body        = file("${path.module}/manifests/02-app/hpa.yaml")
  wait_for_rollout = false
  depends_on       = [kubectl_manifest.api_deployment, helm_release.metrics_server]
}
