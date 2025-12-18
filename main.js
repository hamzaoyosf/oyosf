document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.querySelector('.start-button');
    if (startButton) {
        startButton.addEventListener('click', () => {
            window.open('https://api.whatsapp.com/send?phone=212624550243&text=Hi%F0%9F%91%8B%0AAre%20you%20available%20to%20talk%3F', '_blank');
        });
    }
});
