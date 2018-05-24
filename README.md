# Hello App

A helm chart that runs on GKE cluster

## Getting started

### Prerequisities

* Google Container Cluster
* Helm
* Voyager (deployable via Helm)
* Hello app (deployable via Helm)
* Prometheus (deployable via Helm)

### Content

* hello-helm (NodeJS application deployable with Helm and has support for creating an ingress for Voyager)
* prometheus (Prometheus deployable with Helm)

### Installing

To install Google Container Cluster:

```
gcloud container clusters create hello-cluster --cluster-version=1.10.2-gke.1 --enable-autorepair --machine-type=n1-standard-1 --zone=europe-west1-d --num-nodes=3
```

and we can connect to the cluster afterwards

```
gcloud container clusters get-credentials hello-cluster --zone europe-west1-d --project [project-name]
```

We need to install Helm both locally and on cluster side.

1. Download your desired version (https://github.com/kubernetes/helm/releases)
2. Unpack it (tar -zxvf helm-v2.9.1-linux-amd64.tgz)
3. Find the helm binary in the unpacked directory, and move it to its desired destination (mv linux-amd64/helm /usr/local/bin/helm)

and after on we have to install on cluster side with following command:

```
helm init
```

Careful! You should apply these commands in order to avoid any permission issue errors on helm side.

```
kubectl create serviceaccount --namespace kube-system tiller
kubectl create clusterrolebinding tiller-cluster-rule --clusterrole=cluster-admin --serviceaccount=kube-system:tiller
kubectl patch deploy --namespace kube-system tiller-deploy -p '{"spec":{"template":{"spec":{"serviceAccount":"tiller"}}}}'      
helm init --service-account tiller --upgrade
```
### Voyager

Voyager is L4/L7 Load Balancer based on HAProxy, which mainly focuses on speed, security and reliability. With also some awesome features, like certificate renewals, etc. (https://appscode.com/products/voyager/6.0.0/welcome/)

We need to add new Helm repo in this case

```
helm repo add appscode https://charts.appscode.com/stable/
helm repo update
helm install appscode/voyager --set=rbac.enabled=true --set=cloudProvider=gke
```

Next step is to download hello-app helm chart written in NodeJS, which we can pull from git

```
helm install ./hello-helm/chart/hello -f ./hello-helm/chart/hello/values.yaml
```

This will install the app, as well as an Ingress for voyager.

After roughly a minute, we should perform 'kubectl get svc' for the external IP.

So we should get an output similiar like this

```
NAME                         TYPE           CLUSTER-IP      EXTERNAL-IP      PORT(S)                       AGE
jazzy-dragon-hello           NodePort       10.23.250.29    <none>           80:32508/TCP                  1m
kubernetes                   ClusterIP      10.23.240.1     <none>           443/TCP                       55m
voyager-jazzy-dragon-hello   LoadBalancer   10.23.247.152   146.148.127.29   80:30875/TCP                  1m
voyager-mewing-zebu          ClusterIP      10.23.247.255   <none>           443/TCP,56790/TCP,56791/TCP   3m
```

You can try to access the application over http then!

```
curl -vv http://146.148.127.29/
*   Trying 146.148.127.29...
* TCP_NODELAY set
* Connected to 146.148.127.29 (146.148.127.29) port 80 (#0)
> GET / HTTP/1.1
> Host: 146.148.127.29
> User-Agent: curl/7.58.0
> Accept: */*
> 
< HTTP/1.1 200 OK
< X-Powered-By: Express
< Content-Type: text/html; charset=utf-8
< Content-Length: 12
< ETag: "-312711370"
< Date: Thu, 24 May 2018 13:45:40 GMT
< 
* Connection #0 to host 146.148.127.29 left intact
Hello there!
```

### Redirection /example-proxy to /

I decided to do this on application level, but on other side this can be achieved also on Voyager itself with adding an anotation on the pod

```
annotations:
    ingress.appscode.com/rewrite-target: /
```

```
curl -vv http://146.148.127.29/example-proxy
*   Trying 146.148.127.29...
* TCP_NODELAY set
* Connected to 146.148.127.29 (146.148.127.29) port 80 (#0)
> GET /example-proxy HTTP/1.1
> Host: 146.148.127.29
> User-Agent: curl/7.58.0
> Accept: */*
> 
< HTTP/1.1 302 Found
< X-Powered-By: Express
< Location: /
< Vary: Accept
< Content-Type: text/plain; charset=UTF-8
< Content-Length: 23
< Date: Thu, 24 May 2018 13:46:25 GMT
< 
* Connection #0 to host 146.148.127.29 left intact
Found. Redirecting to /
```

My only concern here was the term 'SECURE', which can mean serving a traffic over https in this case, but we need a domain (we can mimic it through /etc/hosts), but we will hit an issue on issuing a proper certificate for example for existing domain in this case, so it will not work.

### Exposing metrics on /metrics

Metrics should be accessible on: /metrics

### BONUS: Prometheus and scrape metrics from the app

Careful! In repo you will find /prometheus/values.yaml, which has to be edited first and then we deploy it.

The following content has to be edited:

```
      - job_name: hello-app
        static_configs:
          - targets:
            - 35.205.242.56
```

Now we can proceed with Prometheus installation

```
helm install ./prometheus -f ./prometheus/values.yaml
```

Now we can try to access Prometheus

```
export POD_NAME=$(kubectl get pods --namespace default -l "app=prometheus,component=server" -o jsonpath="{.items[0].metadata.name}")
kubectl --namespace default port-forward $POD_NAME 9090
```

and it should be accessible on http://127.0.0.1:9090/

## Author
* **Edin Osmanbegovic**
