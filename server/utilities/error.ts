import { type Response } from "express";



const sendError = (res: Response, message: string, status: number = 400) => {
  res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error</title>
        <style>
          .container-error-server {
            font-family: Arial, sans-serif;
            background-color: #242424;
            color: #ff0000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin: 0;
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
          }
          .error-box {
            background-color: #000000;
            padding: 20px 30px;
            border-radius: 5px;
            text-align: center;
            box-shadow: 0 2px 8px #000000;
          }
          h1 {
            margin: 0 0 10px 0;
          }
          p {
            margin: 0;
          }
        </style>
      </head>
      <body>
      <div class="container-error-server">
        <div class="error-box">
          <h1>Error ${status}</h1>
          <p>${message}</p>
        </div>
      </div>
      </body>
      </html>
    `);
};

interface CustomResponse {
  message?: string | undefined;
  status: number;
  data?: any;
}

const customResponse = ({ message, status, data }: { message?: string; status: number; data?: any }): CustomResponse => ({
  message, status, data
});



export { sendError, customResponse };