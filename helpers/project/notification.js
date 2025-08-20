import { env } from "process";

// Environment variables are now provided by AWS Elastic Beanstalk
// Only load dotenv for local development
if (process.env.NODE_ENV === 'development' || process.env.ENV === 'LOCAL') {
  const dotenv = await import('dotenv');
  dotenv.config({ path: "./.env" });
}

const { SERVER_KEY } = env;
// const FCM = require('fcm-node')
import FCM from "fcm-node";

async function pushNotification(device_token, title, body, type) {
  const fcm = new FCM("AAAAucGiXYs:APA91bFGiOi53xLxZZlJ8h9rSC4st_UwcpVCnm2faEFJRUGgZAmxZCxdwO_vdMdwZv-u6C1sR3bVI1OcssxFnnWlpCsg1mea3iBip8CEZnn4sgBNVZCOpuQLEXKkHOxT4IOuqso1hjYU");

  const message = {
    to: device_token,
    notification: {
      title: title,
      body: body,
      type: type,
    },
  };

  let response;
  const output = await fcm.send(message, function (err, response) {
    if (output) {
      response = output;
    } else {
      response = false;
    }
  });

  return response;
}

export { pushNotification };
