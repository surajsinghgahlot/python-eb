import { env } from "process";

let { user, pwd, senderId } = env;
import axios from "axios";

const sendSMSThroughMobishashtra = async (
  message,
  mobileNumber
) => {
  try {
    let countryCode = "91";
    let msg = encodeURIComponent(message);
    
    let response;

    let final_url = `http://mshastra.com/sendurl.aspx?user=${user}&pwd=${pwd}&senderid=${senderId}&mobileno=${mobileNumber}&msgtext=${msg}&priority=High&CountryCode=${countryCode}`;
    console.log("final_url", final_url)
    const options = {
      method: "GET",
      url:final_url
    };

    // console.log(options, "options");
    const apiResponse = await new Promise(async (resolve, reject) => {
      axios
        .request(options)
        .then(function (response1) {
          resolve(response1.data);

          return response;
        })
        .catch(function (error) {
          console.error(error);
          reject(error);
          return response;
        });
    });
     console.log(apiResponse, "apiResponseapiResponse");
    return apiResponse;
  } catch (error) {
    console.log(error);
    return { ...error, status: false };
  }
};

export { sendSMSThroughMobishashtra };
