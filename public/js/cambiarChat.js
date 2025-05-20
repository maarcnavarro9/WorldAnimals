const chatGlobal = document.getElementById('chatGlobal');
const chatP2P = document.getElementById('chatP2PParent');
const chatIA = document.getElementById('chatIAParent');
const chatGlobalButton = document.getElementById('chatGlobalButton');
const chatP2PButton = document.getElementById('chatP2PButton');
const chatIAButton = document.getElementById('chatIAButton');
const usersList = document.getElementById('userListContainer');

chatGlobalButton.addEventListener('click', () => {
    chatP2P.style.display = "none";
    chatIA.style.display = "none";
    chatGlobal.style.display = "flex";
    usersList.style.display = window.matchMedia("(min-width: 401px)").matches ? "block" : "none";
});

chatIAButton.addEventListener('click', () => {
    chatP2P.style.display = "none";
    chatGlobal.style.display = "none";
    usersList.style.display = "none";
    chatIA.style.display = "flex";
});

chatP2PButton.addEventListener('click', () => {
    chatIA.style.display = "none";
    chatGlobal.style.display = "none";
    usersList.style.display = "none";
    chatP2P.style.display = "flex";
});

