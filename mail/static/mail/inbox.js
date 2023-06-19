document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', (event)=> {
    event.preventDefault()
    send_email()
  })

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(recipient, subject, body) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  body = body.replace(/\//g, '\n')

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recipient ? recipient : '';
  document.querySelector('#compose-subject').value = subject.slice(0, 3) === 'Re:' ? subject : subject ? `Re: ${subject}` : '';
  document.querySelector('#compose-body').value = body ? body : '';
}

function load_mailbox(mailbox) {

  
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  
  fetch(`/emails/${mailbox}`)
  .then(res => res.json())
  .then(emails => {
    let html = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`
     emails.forEach(email => {

      backgrond_color = ""
      if (email.read == true){
        backgrond_color = "gray"
      }

      archive = "none"
      unarchive = "none"
      if(mailbox === 'inbox' && email.read == true){
        unarchive = "none"
        archive=""
      } else if (mailbox === 'archive'){
        unarchive = ""
        archive="none"
      }


      html += `
        <div class="email-border ${backgrond_color}" >
          <div class="row" onclick="load_email(${email.id})">
            <p class="sender">${email.sender}</p>
            <p class="subject">${email.subject}</p>
            <p class="date">${email.timestamp}</p>
          </div>

          <div class="buttons-container">
            <button onclick="archive_email(${email.id})" class="archive ${archive}"><i class="fa-solid fa-box-archive"></i></button>
            <button onclick="unarchive_email(${email.id})" class="archive ${unarchive}"><i class="fa-solid fa-boxes-packing"></i> </button>
          </div>

          </div>
      `
      
    })
    document.querySelector('#emails-view').innerHTML = html
  });
  

}

// My functions

function send_email(){
  recipients = document.querySelector("#compose-recipients").value
  subject = document.querySelector("#compose-subject").value
  body = document.querySelector("#compose-body").value
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients:recipients,
      subject:subject,
      body:body
    })
  }).then(res => {
    recipients = document.querySelector("#compose-recipients").value = ''
    subject = document.querySelector("#compose-subject").value = ''
    body = document.querySelector("#compose-body").value = ''
    load_mailbox('sent')
  })
}


function load_email(id){

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

  fetch(`/emails/${id}`)
  .then(res => res.json())
  .then(email => {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';

    const email_view = document.querySelector('#email-view')
    email_view.style.display = 'block';

    let recipients = ""
    email.recipients.forEach(recipient => {
      recipients += recipient
    })

    const body = `/ / /On ${email.timestamp} ${email.sender} wrote: /${email.body.replace(/\n/g, '/')}` 

    email_view.innerHTML = `
    <div class="email-container">
      <p class="email-sender"><strong>From:</strong> ${email.sender}</p>
      <p class"recipients">
        <strong>Recipients:</strong> ${recipients}
      </p>
      <p><strong>Date:</strong> ${email.timestamp}</p>
      <p class="email-subject"><strong>Subject:</strong> ${email.subject}</p>
      <textarea disabled class="email-text" >${email.body}</textarea>
      <button onclick='compose_email("${email.sender}","${email.subject}","${body}")'>Reply</button>
  
    </div>
    `
  })
}

function archive_email(id){

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  }).then(res => {
    location.reload()
  })

  

}

function unarchive_email(id){

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  }).then(res => {
    location.reload()
  })

}