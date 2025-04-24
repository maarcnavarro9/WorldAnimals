const chatGlobal = document.getElementById('chatGlobal');
const chatP2P = document.getElementById('chatP2P');
const chatIA = document.getElementById('chatIAParent');
const chatGlobalButton = document.getElementById('chatGlobalButton');
const chatP2PButton = document.getElementById('chatP2PButton');
const chatIAButton = document.getElementById('chatIAButton');

chatGlobalButton.addEventListener('click', () => {
    chatP2P.style.display = "none";
    chatIA.style.display = "none";
    chatGlobal.style.display = "flex";
});

chatIAButton.addEventListener('click', () => {
    chatP2P.style.display = "none";
    chatGlobal.style.display = "none";
    chatIA.style.display = "flex";
});

chatP2PButton.addEventListener('click', () => {
    chatIA.style.display = "none";
    chatGlobal.style.display = "none";
    chatP2P.style.display = "flex";
});

