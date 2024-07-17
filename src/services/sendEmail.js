import emailjs from 'emailjs-com';

function sendEmail(To, Name, LastName, TemplateId, Link) {
    const serviceId = process.env.REACT_APP_EMAILJS_SERVICE;
    const userId = process.env.REACT_APP_EMAILJS_PUBLICKEY;
    const templateId = TemplateId;

    emailjs.send(serviceId, templateId, {
        To: To,
        Name: Name,
        LastName: LastName,
        Link: Link || ''
    }, userId)
    .then((response) => {
        console.log('E-mail enviado com sucesso!', response.status, response.text);
    }, (error) => {
        console.error('Erro ao enviar o e-mail:', error);
    });
}

export default sendEmail;
