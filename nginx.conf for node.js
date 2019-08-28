user  www-data;
worker_processes auto;
worker_cpu_affinity auto;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;





events {
        worker_connections  1024;
        multi_accept on;

}



http  {
        charset utf-8;
        charset_types utf-8;
        include           /etc/nginx/mime.types;
        default_type      application/octet-stream;
        server_tokens     off;
        log_format  main_ext                        '$remote_addr - $remote_user [$time_local] "$request" '
                                                    '$status $body_bytes_sent "$http_referer" '
                                                    '"$http_user_agent" "$http_x_forwarded_for" '
                                                    '"$host" sn="$server_name" '
                                                     'rt=$request_time '
                                                     'ua="$upstream_addr" us="$upstream_status" '
                                                     'ut="$upstream_response_time" ul="$upstream_response_length" '
                                                     'cs=$upstream_cache_status' ;

        access_log  /var/log/nginx/access.log  main_ext;
        error_log  /var/log/nginx/error.log warn;

        sendfile       on;
        tcp_nopush     on;
        tcp_nodelay    on;
        reset_timedout_connection on;
        keepalive_timeout  120;
        keepalive_requests 1000;

        map $http_accept $webp_suffix {
        default   "";
        "~*webp"  ".webp";
        }

        server {
                listen 80;
                server_name www.ozpp-spb.ru ozpp-spb.ru;
                return 301 https://ozpp-spb.ru$request_uri;
                }

        server {
                listen 443;
                server_name www.ozpp-spb.ru;
                return 301 https://ozpp-spb.ru$request_uri;
                }    
        
        server {
                listen 443 default_server ssl http2 fastopen=256;
                server_name ozpp-spb.ru;
                root /usr/share/nginx/html;

                ssl_certificate /etc/letsencrypt/live/ozpp-spb.ru/fullchain.pem;
                ssl_certificate_key /etc/letsencrypt/live/ozpp-spb.ru/privkey.pem;
                ssl_buffer_size 8k;
                ssl_session_timeout 2d;
                ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # протоколы, которые надо использовать
                ssl_ciphers "ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA:ECDHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:ECDHE-ECDSA-DES-CBC3-SHA:ECDHE-RSA-DES-CBC3-SHA:EDH-RSA-DES-CBC3-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:DES-CBC3-SHA:!DSS";
                ssl_prefer_server_ciphers on; # предпочтение серверных шифров ssl_ciphers
                ssl_stapling on; #  Прикрепление OCSP-ответов сервером для проверки актуальности вертификата
                ssl_stapling_verify on; #проверка сервером ответов OCSP
                ssl_trusted_certificate /etc/letsencrypt/live/ozpp-spb.ru/chain.pem; # файл с доверенным сертификатом
                resolver 8.8.8.8 8.8.4.4 valid=300s ipv6=off;
                resolver_timeout 5s;


                autoindex off;
                etag off;

                add_header X-XSS-Protection "1; mode=block";
                add_header Strict-Transport-Security max-age=15768000; #сайт доступен только по https
                add_header X-Content-Type-Options nosniff;

                brotli_static on;
                brotli on;
                brotli_comp_level 7;
                brotli_types text/plain text/css text/xml application/x-javascript application/javascript text/javascript;

                gzip on;
                gzip_static on;
                gzip_vary on;
                gzip_min_length 1100;
                gzip_buffers 64 8k;
                gzip_comp_level 7;
                gzip_http_version 1.1;
                gzip_proxied any;
                gzip_types text/plain text/css text/xml image/svg+xml image/x-icon application/xml application/x-javascript application/javascript text/javascript application/xml+rss application/json;
                gzip_disable "MSIE [1-6]\.(?!.*SV1)";
          
                
                location / { 
                                proxy_pass "http://localhost:8080/";  
                }
                                
               location ~* ^/images/.+\.(png|jpg)$ { # Этот location должен быть под location/ 
               root /usr/share/nginx/html;
               add_header Vary Accept;
               try_files $uri$webp_suffix $uri =404;
               } 

               location ~ .(html|jpg|png|gif|jpeg|css|js|ico|webp|svg)$ {
                                expires 6M;
                                add_header Cache-Control public;
                                add_header Cache-Control immutable;
                                try_files $uri$webp_suffix $uri =404;
                        }
                
        }
        
        #include /etc/nginx/conf.d/*.conf;

}




