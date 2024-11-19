class NameCreator{
    constructor(prefix = 'EM') {
        this.prefix = prefix
        this.current_count = 0
    }


    addName() {
        this.current_count +=1
        return this.prefix + this.current_count.toString()
    }
}

class EventManager {
    constructor(NameCreator) {
        this.eventListeners = {}; // Объект для хранения всех добавленных обработчиков
        this.NameCreator = NameCreator
    }


    hasEvent(name){
        if (this.eventListeners.hasOwnProperty(name)){return true}
        else {return false}

    }

    // Метод для добавления события
    addEvent(element, eventType, callback, options) {

        let name = this.NameCreator.addName()

        let eve = (event) => {callback(event);}
        element.addEventListener(eventType, 
            callback,
             options);
        // Сохраняем обработчик событий по имени
        this.eventListeners[name] = { element, eventType, callback, options };
        return name
    }


    removeEvent (name) {

        if (this.hasEvent(name)) {
                const listener = this.eventListeners[name];
                listener.element.removeEventListener(listener.eventType, listener.callback, listener.options);
            }

      delete this.eventListeners[name]


    }

    // Метод для удаления всех событий
    removeAllEvents() {
        console.log('Удаление всех элементов');
        // Перебираем все добавленные обработчики и удаляем их
        for (const name in this.eventListeners) {
            this.removeEvent(name)
        }
        // Очищаем объект

    }

    getAllKeys() {
        return Object.keys(this.eventListeners);
    }
}


class TouchTracker{
        constructor(eventManager) {
                this.mouseX = null;
                this.mouseY = null;

                this.eventManager = eventManager
                this.eventName

                this.__handleMouse = this.__handleMouse.bind(this);
                
        }

        startEvents() {
            console.log('start MouseTracker')
            this.eventName = this.eventManager.addEvent(document, 'mousemove', this.__handleMouse);
            //console.log('start MouseTracker this.eventName', this.eventName)


        }

        // Останавливаем отслеживание событий
        stopEvents() {
                console.log('stopEvents MouseTracker')
                this.eventManager.removeEvent(this.eventName);
                this.eventName = null
                this.mouseX = null;
                this.mouseY = null;
        }

        // Обработчик события мыши
        __handleMouse(event) {
                this.mouseX = event.clientX; // Координата X мыши
                this.mouseY = event.clientY; // Координата Y мыши

                //console.log(this.getMousePosition());
        }

        // Функция для получения текущих координат мыши
        getPos() {
                return { x: this.mouseX, y: this.mouseY };
        }

        console_log(){
        let intervalMainId = setInterval(() => {
            console.log(`MouseTracker class this.mouseX ${this.mouseX}, this.mouseY ${this.mouseY}`)
        }, 100)
    }
}

const NameManager = new NameCreator()
const eventManager = new EventManager(NameManager);

if (window.matchMedia('(hover: none)').matches){}



