# metrics-server — obrigatorio para o HPA coletar CPU e memoria dos Pods
# --kubelet-insecure-tls e necessario em clusters Kind (TLS auto-assinado)
resource "helm_release" "metrics_server" {
  name       = "metrics-server"
  repository = "https://kubernetes-sigs.github.io/metrics-server/"
  chart      = "metrics-server"
  namespace  = "kube-system"
  version    = "3.12.1"

  set {
    name  = "args[0]"
    value = "--kubelet-insecure-tls"
  }

  depends_on = [kind_cluster.oficina]
}
