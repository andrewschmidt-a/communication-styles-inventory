const client = require("@sendgrid/mail");
const { MongoClient } = require("mongodb");
const sharp = require('sharp');
function getAttachment(body){
  return `<svg xmlns="http://www.w3.org/2000/svg" 
  xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 300 300" width="300pt" height="300pt">
  
  <defs>
      <clipPath id="_clipPath_rqatKbygh5QZF4AQWI1kvTrCXwUilDez">
          <rect width="300" height="300"/>
      </clipPath>
  </defs>
  <g clip-path="url(#_clipPath_rqatKbygh5QZF4AQWI1kvTrCXwUilDez)">
      <g opacity="0.88">
          <rect x="0" y="0" width="300" height="300" transform="matrix(1,0,0,1,0,0)" fill="rgb(255,255,255)"/>
      </g>
      <g opacity="0.4">
          <rect x="0" y="0" width="150" height="150" transform="matrix(1,0,0,1,0,0)" fill="rgb(255,0,0)"/>
          <rect x="150" y="0" width="150" height="150" transform="matrix(1,0,0,1,0,0)" fill="rgb(0,255,0)"/>
          <rect x="0" y="150" width="150" height="150" transform="matrix(1,0,0,1,0,0)" fill="rgb(255,122,0)"/>
          <rect x="150" y="150" width="150" height="150" transform="matrix(1,0,0,1,0,0)" fill="rgb(0,0,255)"/>
      </g>
      <line x1="150" y1="0" x2="150" y2="300" vector-effect="non-scaling-stroke" stroke-width="1" stroke="rgb(0,0,0)" stroke-linejoin="miter" stroke-linecap="square" stroke-miterlimit="3"/>
      <line x1="0" y1="150" x2="300" y2="150" vector-effect="non-scaling-stroke" stroke-width="1" stroke="rgb(0,0,0)" stroke-linejoin="miter" stroke-linecap="square" stroke-miterlimit="3"/>
      <g style="mix-blend-mode:normal;" opacity="0.32">
          <text transform="matrix(1,0,0,1,44.5,70.777)" style="font-family:'Open Sans';font-weight:400;font-size:20px;font-style:normal;fill:#000000;stroke:none;">Action: ${body.action}</text>
      </g>
      <g style="mix-blend-mode:normal;" opacity="0.32">
          <text transform="matrix(1,0,0,1,187.5,70.777)" style="font-family:'Open Sans';font-weight:400;font-size:20px;font-style:normal;fill:#000000;stroke:none;">Process: ${body.process}</text>
      </g>
      <g style="mix-blend-mode:normal;" opacity="0.32">
          <text transform="matrix(1,0,0,1,49,251.777)" style="font-family:'Open Sans';font-weight:400;font-size:20px;font-style:normal;fill:#000000;stroke:none;">Ideas: ${body.ideas}</text>
      </g>
      <g style="mix-blend-mode:normal;" opacity="0.32">
          <text transform="matrix(1,0,0,1,192,251.777)" style="font-family:'Open Sans';font-weight:400;font-size:20px;font-style:normal;fill:#000000;stroke:none;">People: ${body.people}</text>
      </g>
      <circle vector-effect="non-scaling-stroke" cx="${body.action_x}" cy="${body.action_y}" r="4" fill="rgb(255,0,0)"/>
      <circle vector-effect="non-scaling-stroke" cx="${body.ideas_x}" cy="${body.ideas_y}" r="4" fill="rgb(255,0,0)"/>
      <circle vector-effect="non-scaling-stroke" cx="${body.process_x}" cy="${body.process_y}" r="4" fill="rgb(255,0,0)"/>
      <circle vector-effect="non-scaling-stroke" cx="${body.people_x}" cy="${body.people_y}" r="4" fill="rgb(255,0,0)"/>
      <line x1="${body.ideas_x}" y1="${body.ideas_y}" x2="${body.people_x}" y2="${body.people_y}" vector-effect="non-scaling-stroke" stroke-width="1" stroke="rgb(255,0,0)" stroke-linejoin="miter" stroke-linecap="square" stroke-miterlimit="3"/>
      <line x1="${body.action_x}" y1="${body.action_y}" x2="${body.process_x}" y2="${body.process_y}" vector-effect="non-scaling-stroke" stroke-width="1" stroke="rgb(255,0,0)" stroke-linejoin="miter" stroke-linecap="square" stroke-miterlimit="3"/>
      <line x1="${body.ideas_x}" y1="${body.ideas_y}" x2="${body.action_x}" y2="${body.action_y}" vector-effect="non-scaling-stroke" stroke-width="1" stroke="rgb(255,0,0)" stroke-linejoin="miter" stroke-linecap="square" stroke-miterlimit="3"/>
      <line x1="${body.people_x}" y1="${body.people_y}" x2="${body.process_x}" y2="${body.process_y}" vector-effect="non-scaling-stroke" stroke-width="1" stroke="rgb(255,0,0)" stroke-linejoin="miter" stroke-linecap="square" stroke-miterlimit="3"/>
  </g>
</svg>`
}
function getEmail(body){
  return `
  <!doctype html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>Simple Transactional Email</title>
      <style>
        /* -------------------------------------
            GLOBAL RESETS
        ------------------------------------- */
        
        /*All the styling goes here*/
        
        img {
          border: none;
          -ms-interpolation-mode: bicubic;
          max-width: 100%; 
        }
  
        body {
          background-color: #f6f6f6;
          font-family: sans-serif;
          -webkit-font-smoothing: antialiased;
          font-size: 14px;
          line-height: 1.4;
          margin: 0;
          padding: 0;
          -ms-text-size-adjust: 100%;
          -webkit-text-size-adjust: 100%; 
        }
  
        table {
          border-collapse: separate;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
          width: 100%; }
          table td {
            font-family: sans-serif;
            font-size: 14px;
            vertical-align: top; 
        }
  
        /* -------------------------------------
            BODY & CONTAINER
        ------------------------------------- */
  
        .body {
          background-color: #f6f6f6;
          width: 100%; 
        }
  
        /* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
        .container {
          display: block;
          margin: 0 auto !important;
          /* makes it centered */
          max-width: 580px;
          padding: 10px;
          width: 580px; 
        }
  
        /* This should also be a block element, so that it will fill 100% of the .container */
        .content {
          box-sizing: border-box;
          display: block;
          margin: 0 auto;
          max-width: 580px;
          padding: 10px; 
        }
  
        /* -------------------------------------
            HEADER, FOOTER, MAIN
        ------------------------------------- */
        .main {
          background: #ffffff;
          border-radius: 3px;
          width: 100%; 
        }
  
        .wrapper {
          box-sizing: border-box;
          padding: 20px; 
        }
  
        .content-block {
          padding-bottom: 10px;
          padding-top: 10px;
        }
  
        .footer {
          clear: both;
          margin-top: 10px;
          text-align: center;
          width: 100%; 
        }
          .footer td,
          .footer p,
          .footer span,
          .footer a {
            color: #999999;
            font-size: 12px;
            text-align: center; 
        }
  
        /* -------------------------------------
            TYPOGRAPHY
        ------------------------------------- */
        h1,
        h2,
        h3,
        h4 {
          color: #000000;
          font-family: sans-serif;
          font-weight: 400;
          line-height: 1.4;
          margin: 0;
          margin-bottom: 30px; 
        }
  
        h1 {
          font-size: 35px;
          font-weight: 300;
          text-align: center;
          text-transform: capitalize; 
        }
  
        p,
        ul,
        ol {
          font-family: sans-serif;
          font-size: 14px;
          font-weight: normal;
          margin: 0;
          margin-bottom: 15px; 
        }
          p li,
          ul li,
          ol li {
            list-style-position: inside;
            margin-left: 5px; 
        }
  
        a {
          color: #3498db;
          text-decoration: underline; 
        }
  
        /* -------------------------------------
            BUTTONS
        ------------------------------------- */
        .btn {
          box-sizing: border-box;
          width: 100%; }
          .btn > tbody > tr > td {
            padding-bottom: 15px; }
          .btn table {
            width: auto; 
        }
          .btn table td {
            background-color: #ffffff;
            border-radius: 5px;
            text-align: center; 
        }
          .btn a {
            background-color: #ffffff;
            border: solid 1px #3498db;
            border-radius: 5px;
            box-sizing: border-box;
            color: #3498db;
            cursor: pointer;
            display: inline-block;
            font-size: 14px;
            font-weight: bold;
            margin: 0;
            padding: 12px 25px;
            text-decoration: none;
            text-transform: capitalize; 
        }
  
        .btn-primary table td {
          background-color: #3498db; 
        }
  
        .btn-primary a {
          background-color: #3498db;
          border-color: #3498db;
          color: #ffffff; 
        }
  
        /* -------------------------------------
            OTHER STYLES THAT MIGHT BE USEFUL
        ------------------------------------- */
        .last {
          margin-bottom: 0; 
        }
  
        .first {
          margin-top: 0; 
        }
  
        .align-center {
          text-align: center; 
        }
  
        .align-right {
          text-align: right; 
        }
  
        .align-left {
          text-align: left; 
        }
  
        .clear {
          clear: both; 
        }
  
        .mt0 {
          margin-top: 0; 
        }
  
        .mb0 {
          margin-bottom: 0; 
        }
  
        .preheader {
          color: transparent;
          display: none;
          height: 0;
          max-height: 0;
          max-width: 0;
          opacity: 0;
          overflow: hidden;
          mso-hide: all;
          visibility: hidden;
          width: 0; 
        }
  
        .powered-by a {
          text-decoration: none; 
        }
  
        hr {
          border: 0;
          border-bottom: 1px solid #f6f6f6;
          margin: 20px 0; 
        }
  
        /* -------------------------------------
            RESPONSIVE AND MOBILE FRIENDLY STYLES
        ------------------------------------- */
        @media only screen and (max-width: 620px) {
          table[class=body] h1 {
            font-size: 28px !important;
            margin-bottom: 10px !important; 
          }
          table[class=body] p,
          table[class=body] ul,
          table[class=body] ol,
          table[class=body] td,
          table[class=body] span,
          table[class=body] a {
            font-size: 16px !important; 
          }
          table[class=body] .wrapper,
          table[class=body] .article {
            padding: 10px !important; 
          }
          table[class=body] .content {
            padding: 0 !important; 
          }
          table[class=body] .container {
            padding: 0 !important;
            width: 100% !important; 
          }
          table[class=body] .main {
            border-left-width: 0 !important;
            border-radius: 0 !important;
            border-right-width: 0 !important; 
          }
          table[class=body] .btn table {
            width: 100% !important; 
          }
          table[class=body] .btn a {
            width: 100% !important; 
          }
          table[class=body] .img-responsive {
            height: auto !important;
            max-width: 100% !important;
            width: auto !important; 
          }
        }
  
        /* -------------------------------------
            PRESERVE THESE STYLES IN THE HEAD
        ------------------------------------- */
        @media all {
          .ExternalClass {
            width: 100%; 
          }
          .ExternalClass,
          .ExternalClass p,
          .ExternalClass span,
          .ExternalClass font,
          .ExternalClass td,
          .ExternalClass div {
            line-height: 100%; 
          }
          .apple-link a {
            color: inherit !important;
            font-family: inherit !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
            text-decoration: none !important; 
          }
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
          }
          .btn-primary table td:hover {
            background-color: #34495e !important; 
          }
          .btn-primary a:hover {
            background-color: #34495e !important;
            border-color: #34495e !important; 
          } 
        }
  
      </style>
    </head>
    <body class="">
      <span class="preheader">Your personal communication styles inventory results</span>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
        <tr>
          <td>&nbsp;</td>
          <td class="container">
            <div class="content">
  
              <!-- START CENTERED WHITE CONTAINER -->
              <table role="presentation" class="main">
  
                <!-- START MAIN CONTENT AREA -->
                <tr>
                  <td class="wrapper">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p>Hi there,</p>
                          <p>Your Results are:</p>
                          
                          ${getAttachment(body)}
                          
                          <p>Attached is an image visualizing your results</p>
                          <p>You may also return to the app and view all your results using this <a href="https://communication-styles-inventory.nemcrunchers.dev/?id=${body.user_id}">link</a></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
  
              <!-- END MAIN CONTENT AREA -->
              </table>
              <!-- END CENTERED WHITE CONTAINER -->
            </div>
          </td>
          <td>&nbsp;</td>
        </tr>
      </table>
    </body>
  </html>
  `
}



function sendEmail(client, message, senderEmail, senderName, toEmailAddress, html, attachment) {
  return new Promise((fulfill, reject) => {
    const data = {
      from: {
        email: senderEmail,
        name: senderName
      },
      subject: 'Communication Styles Inventory Results',
      to: toEmailAddress,
      html: html,
      attachments: [
        {
          content: attachment,
          filename: "communication_styles_inventory_results.svg",
          type: "image/svg+xml",
          disposition: "attachment"
        }
      ]
    }

    client
      .send(data)
      .then(([response, body]) => {
        fulfill(response)
      })
      .catch(error => reject(error))
  })
}

exports.handler = function(event, context, callback) {
  const {
    SENDGRID_API_KEY,
    SENDGRID_SENDER_EMAIL,
    SENDGRID_SENDER_NAME,
    MONGODB_CONNECTION_STRING
  } = process.env

  let body = JSON.parse(event.body)
  const message = body.message

  client.setApiKey(SENDGRID_API_KEY)
  const mongo = new MongoClient(MONGODB_CONNECTION_STRING);

  let run = async function run() {
    let result = null;
    try {
      await mongo.connect();
      const database = mongo.db('CommunicationStylesInventory');
      const collection = database.collection('Results');
      result = await collection.findOne({_id: body.id});
    } finally {
      // Ensures that the client will close when you finish/error
      await mongo.close();
      const max_per_cat = 20;
      const max_r_cat = 212.132;
      let calculate_side = (c) => Math.sqrt(Math.pow(c, 2) / 2)
      let action_r = result.action * (max_r_cat) / max_per_cat
      let action_x = Math.round(150 - calculate_side(action_r))
      let action_y = Math.round(150 - calculate_side(action_r))
      
      let ideas_r = result.ideas * (max_r_cat) / max_per_cat
      let ideas_x = Math.round(150 - calculate_side(ideas_r))
      let ideas_y = Math.round(150 + calculate_side(ideas_r))
      
      let process_r = result.process * (max_r_cat) / max_per_cat
      let process_x = Math.round(150 + calculate_side(process_r))
      let process_y = Math.round(150 - calculate_side(process_r))
      
      let people_r = result.people * (max_r_cat) / max_per_cat
      let people_x = Math.round(150 + calculate_side(people_r))
      let people_y = Math.round(150 + calculate_side(people_r))
      body = Object.assign(body, {
        "date": result.date,
        "user_id": result.user_id,
        "action": result.action,
        "action_x": action_x,
        "action_y": action_y,
        "people": result.people,
        "people_x": people_x,
        "people_y": people_y,
        "process": result.process,
        "process_x": process_x,
        "process_y": process_y,
        "ideas": result.ideas,
        "ideas_x": ideas_x,
        "ideas_y": ideas_y
      })
      // let pngPhoto = await sharp().png().toBuffer();
      sendEmail(
        client,
        message,
        SENDGRID_SENDER_EMAIL,
        SENDGRID_SENDER_NAME,
        body.to,
        getEmail(body),
        Buffer.from(getAttachment(body)).toString('base64')
      )
      .then(response => callback(null, { statusCode: response.statusCode }))
      .catch(err => callback(err, null))
    }
  }
  run().catch(console.dir);

}