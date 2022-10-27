# nginx state for serving content
FROM nginx:alpine

# Set working directory to nginx asset directory
WORKDIR /nginx

# Remove the default Nginx configuration file
RUN rm -v /etc/nginx/conf.d/default.conf

# Copy a configuration file from the current directory
ADD default.conf /etc/nginx/conf.d/

ENTRYPOINT ["nginx", "-g", "daemon off;"]