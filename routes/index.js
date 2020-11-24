const express = require('express');
const router = express.Router();
const axios = require('axios')
let actualState = null;

router.get('/', function (req, res, next) {
  try {
    axios.get("https://dev.fractal-it.fr:8443/fake_health_test?dynamic=true")
      .then(result => {
        // Init the actualState value with a new object if new or different status from actual
        if (!actualState || result.data.status != actualState.status) {
          actualState = { status: result.data.status, date: new Date() };
        }
        
        // Calculate the seconds since last actualisation
        const now = new Date();
        const intervalInSeconds = Math.round(Math.abs((actualState.date.getTime() - now.getTime()) / 1000));
        const time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
        
        if (actualState.status === "ok") {
          // If status is "ok" and the log hasn't been sent yet
          if (!actualState.log) {
            console.log(`${time} : Status est ok`);
            actualState.log = true;
          }
        } else {
          // The status is "error" since 30sec and the log hasn't been sent yet
          if(!actualState.log && intervalInSeconds >= 30) {
            console.log(`${time} : Status est en erreur depuis plus de 30s`);
            actualState.log = true;
          }
        }

        // Render the result in the client
        res.render('index', { status: actualState.status, seconds: intervalInSeconds });
      })
      .catch(err => res.send(err));
  }
  catch(err) {
      console.error("Une erreur est survenue : ", err);
  }
});


module.exports = router;
