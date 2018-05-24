FROM node:8.11.2-stretch

# Install the application
ADD package.json /app/package.json
RUN cd /app && npm install --save express && npm install --save express-prom-bundle && npm install --save prom-client && npm install --save appmetrics-prometheus && npm install --save
ADD app.js /app/app.js
ENV WEB_PORT 80
EXPOSE  80

CMD ["node", "/app/app.js"]

