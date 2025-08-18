const express = require('express');
const { sendEmail } = require('../mailModule');
const app = express();
const port = process.env.PORT || 8081;

app.use(express.json());

// email endpoint
app.post('/api/send/email', (req, res) => {
  console.log(req.body,'req.body')
  const email = req.body.email;
  const htmlContent = "<div>Mail Body Content</div>";
  const emailSubject = "Test Mail Subject";
  sendEmail(email, htmlContent, emailSubject).then((data)=> {
    console.log(data,'res')
    res.status(200).json({ data : data })
  }).catch((err)=> {
    console.log(err,'err',err.message)
    res.status(400).json({ data : err })
  })
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('healthy wealthy');
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
