export default class Modal extends HTMLElement {

    constructor() {
        super();
    }

    public static Create(title: string, message: string, background: string) {
        if (!window.customElements.get('final-modal'))
            window.customElements.define('final-modal', Modal);
        let modal = document.createElement('final-modal') as Modal;
        modal.style.position = "fixed";
        modal.style.zIndex = String(2000);
        modal.style.left = "0px";
        modal.style.top = "0px";
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.overflow = "hidden";
        modal.style.backgroundColor = "rgba(0,0,0,0.4)";
        let innerDiv = document.createElement('div');
        innerDiv.style.background = background;
        innerDiv.style.zIndex = String(2500);
        innerDiv.style.position = "absolute";
        innerDiv.style.top = "300px";
        innerDiv.style.left = "500px";
        innerDiv.style.width = "200px";
        innerDiv.style.height = "200px";
        let innerH1 = document.createElement('h1');
        innerH1.innerText = title;
        innerDiv.appendChild(innerH1);
        let innerP = document.createElement('p');
        innerP.innerText = message;
        innerDiv.appendChild(innerP);
        let closeButton = document.createElement('button');
        closeButton.innerText = "Close";
        closeButton.addEventListener("click", () => modal.Destroy());
        innerDiv.appendChild(closeButton);
        modal.append(innerDiv);
        return modal;
    }

    public Show() {
        document.body.appendChild(this);
    }

    public Destroy() {
        this.remove();
    }

}
