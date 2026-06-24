provider "kind" {}

# Cluster Kind com mapeamento de porta para o NodePort da API
resource "kind_cluster" "oficina" {
  name       = var.cluster_name
  node_image = var.node_image

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"

      kubeadm_config_patches = [
        "kind: InitConfiguration\nnodeRegistration:\n  kubeletExtraArgs:\n    node-labels: \"ingress-ready=true\"\n"
      ]

      extra_port_mappings {
        container_port = 30080
        host_port      = 3000
        protocol       = "TCP"
      }
    }

    node {
      role = "worker"
    }

    node {
      role = "worker"
    }
  }
}

# Providers apontam para as credenciais do cluster Kind recem criado
provider "kubernetes" {
  host                   = kind_cluster.oficina.endpoint
  cluster_ca_certificate = kind_cluster.oficina.cluster_ca_certificate
  client_certificate     = kind_cluster.oficina.client_certificate
  client_key             = kind_cluster.oficina.client_key
}

provider "helm" {
  kubernetes {
    host                   = kind_cluster.oficina.endpoint
    cluster_ca_certificate = kind_cluster.oficina.cluster_ca_certificate
    client_certificate     = kind_cluster.oficina.client_certificate
    client_key             = kind_cluster.oficina.client_key
  }
}

provider "kubectl" {
  host                   = kind_cluster.oficina.endpoint
  cluster_ca_certificate = kind_cluster.oficina.cluster_ca_certificate
  client_certificate     = kind_cluster.oficina.client_certificate
  client_key             = kind_cluster.oficina.client_key
  load_config_file       = false
}
