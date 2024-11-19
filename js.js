
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
        element.addEventListener(eventType, callback, options);
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
        //console.log('Удаление всех элементов');
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



class MouseTracker{
		constructor(eventManager) {
				this.mouseX = null;
				this.mouseY = null;

				this.eventManager = eventManager
				this.eventName

				this.__handleMouse = this.__handleMouse.bind(this);
				
		}

		startEvents() {
			//console.log('start MouseTracker')
			this.eventName = this.eventManager.addEvent(document, 'mousemove', this.__handleMouse);
			//console.log('start MouseTracker this.eventName', this.eventName)


		}

		// Останавливаем отслеживание событий
		stopEvents() {
				//console.log('stopEvents MouseTracker')
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




class TouchTracker extends MouseTracker{
	constructor(eventManager) {
		super(eventManager)
	}

	startEvents() {
			//console.log('start touchTracker')
			this.eventName = this.eventManager.addEvent(document, 'touchmove', this.__handleMouse);
			//console.log('start MouseTracker this.eventName', this.eventName)
		}

	__handleMouse(event) {
		if (event.touches && event.touches.length > 0) {
		    this.mouseX = event.touches[0].clientX; // Координата X первого касания
		    this.mouseY = event.touches[0].clientY; // Координата Y первого касания
			}
		}
}


class IntervalManager {
  constructor() {
    this.intervals = [];  // Массив для хранения всех идентификаторов интервалов
  }

  // Метод для установки интервала
  setInterval(callback, delay) {
    const intervalId = window.setInterval(callback, delay);  // Создаем интервал
    this.intervals.push(intervalId);  // Добавляем его в массив
    return intervalId;  // Возвращаем идентификатор интервала
  }

  // Метод для очистки одного интервала
  clearSingleInterval(intervalId) {
    const index = this.intervals.indexOf(intervalId);  // Ищем идентификатор
    if (index !== -1) {
      window.clearInterval(intervalId);  // Очищаем интервал
      this.intervals.splice(index, 1);  // Удаляем идентификатор из списка
  }
    }

  // Метод для очистки всех интервалов
  clearIntervals() {
    while (this.intervals.length !== 0){
    for (let intervalId of this.intervals) {
      this.clearSingleInterval(intervalId);  // Очищаем каждый интервал
    }
  }
  }

  // Метод для получения всех текущих интервалов
  getAllIntervals() {
    return this.intervals;
  }
}






class Slider{

		constructor(content, nested, eventmanager, intervalManager) {
				this.eventManager = eventmanager
				this.eventManagerDict = {}




				this.content = content;
				this.nested = nested;

				this.LeftMost = 5
				this.bias = 40 // Отклонение для правого края


				this.MouseTracker = new MouseTracker(eventmanager)
				this.TouchTracker = new TouchTracker(eventManager)
				this.curPos = null

                this.intervalManager = intervalManager // Используется для  MouseDown и ToucheDown
                this.currentInterval = null
				

		}


		//Меняет style.left '.nested' на `${pixels}px`
		absolutePosition(pixels){
				//console.log('absolutePosition')
				this.nested.style.left = `${pixels}px`;
		}


		//Найти текущее style.left элемента nested
		__findCurrentLeft(){
				//console.log('__findCurrentLeft()')
				return parseInt(window.getComputedStyle(this.nested).left, 10) || 0;
		}


		//Найти максимальное style.left элемента nested 
		__findMaxLeft(){
				//console.log('__findMaxLeft()')
				let innerWidth = parseFloat(window.getComputedStyle(this.content).width)
				let barWidth = parseFloat(window.getComputedStyle(this.nested).width)

				return -1*(barWidth - innerWidth) - this.bias
		}

		//Найти к чему ближе текущая точка
		__closestNumber(n, x, y) {
				//console.log('__closestNumber')
				// Проверяем, что x меньше y, иначе меняем их местами

				if (x > y) {
								[x, y] = [y, x]; // Делаем перестановку значений
				}

				// Если n не в пределах от x до y, находим ближайшее к n
				if (n < x) {
								return x; // Если n меньше x, возвращаем x
				} else if (n > y) {
								return y; // Если n больше y, возвращаем y
				}
				return null; // Или можно вернуть n, если хотите, чтобы n оставалось в пределах диапазона
		}

		//Ответит (true/false), будет ли pixels + currentLeft в диапазоне от [min, max]
		__checkInRange(pixels){
				//console.log('__checkInRange')
				const currentLeft = this.__findCurrentLeft()

				let r = this.__findMaxLeft()
				if (currentLeft+pixels < this.LeftMost + 1 && currentLeft+pixels > r){return true}

				else {return false}
		}

		//Возвращает в позиции от и до, Вернуть в позицию? [да, к ближайщему числу] / [Нет, undefined]
		__returnInRange(pixels){
				//console.log('__returnInRange')
				if (this.__checkInRange(pixels) == false){
						return [true, this.__closestNumber(this.__findCurrentLeft() + pixels, this.LeftMost ,this.__findMaxLeft())]

				}

				else{
						return [false, undefined]
				}

		}

		//Меняет позицию, добавить при изменениях scale
		returnInRange(pixels = 0){
				//console.log('returnInRange')
				let result = this.__returnInRange(pixels);
				if (result[0]){this.absolutePosition(result[1])}
		}

		//Получить позицию мыши используя класс mouseTracker и переменную this.mymouseTracker
		getMousePosition() {
				//console.log('getMousePosition()')
				return this.mymouseTracker.getMousePosition()
		}


		// Добавить пикселей к Left элемента relevant
		addToLeft(pixelsToAdd) {
		//console.log('addToLeft')
		// Получаем текущее значение left через getComputedStyle
		const currentLeft = parseInt(window.getComputedStyle(nested).left, 10) || 0;

		// Прибавляем нужное количество пикселей
		const newLeft = currentLeft + pixelsToAdd;


		if (this.__checkInRange(pixelsToAdd)){this.nested.style.left = `${newLeft}px`;}
		else {this.returnInRange(pixelsToAdd)}
		}


		start() {
			//console.log('enter start()')
			let name
			
			let objectdown
			let objectup
			let objectenter
			let objectleave

			if (window.matchMedia('(hover: hover)').matches) {
				console.log('(hover: hover)')

				objectdown = 'mousedown'
				objectup = 'mouseup'
				objectenter = 'mouseenter'
				objectleave = 'mouseleave'

				let forHoverable = () => {

					let enter_preset = (event) => {

						this.MouseTracker.startEvents()
						let press_preset = (event) => {

							
							//console.log('Создаем this.intervalMainId')

							let interval_preset = () => {
								//console.log(this.intervalMainId)
								let {x, y} = this.MouseTracker.getPos()

								//console.log(this.curPos, x)
	                            if (this.curPos == null){
	                            	//console.log(`curPos будет равен ${x}`)
	                            	this.curPos = x
	                            	//console.log(this.curPos)
	                            }

	                            else{
	                                //console.log(`result[0] ${result[0]} - curPos ${this.curPos} = ${result[0] - this.curPos}`)

	                                //console.log(`${x} - ${this.curPos}: ${x - this.curPos}`)
	                                this.addToLeft(x - this.curPos)
	                                this.curPos = x
	                                }
							}

							if (this.currentInterval === null){
								this.currentInterval = this.intervalManager.setInterval(interval_preset , 100)
								//console.log('this.currentInterval ', this.currentInterval)
							}

						} 

						name = this.eventManager.addEvent(this.content, objectdown, press_preset)
						this.eventManagerDict[objectdown] = name

						let mouseUp_preset = (event) => {
							//console.log('mouseUp_presett')
							
							if (this.currentInterval !== null){
								this.intervalManager.clearSingleInterval(this.currentInterval)
								this.currentInterval = null
								let new_name = this.eventManagerDict[objectdown]

								this.eventManager.removeEvent(new_name)

								delete this.eventManagerDict[objectdown]

								this.curPos = null;

								name = this.eventManager.addEvent(this.content, objectdown, press_preset)
								this.eventManagerDict[objectdown] = name
								}

						}



						//console.log('enter_preset')
						
						name = this.eventManager.addEvent(this.content, objectup, mouseUp_preset)
						this.eventManagerDict[objectup] = name		
				}

				let leave_preset = () => {
					//console.log('Leave_preset')

					this.MouseTracker.stopEvents()

					this.eventManager.removeEvent(this.eventManagerDict[objectdown])	
					delete this.eventManagerDict[objectdown]	

					this.eventManager.removeEvent(this.eventManagerDict[objectup])	
					delete this.eventManagerDict[objectup]					
				}


				name = this.eventManager.addEvent(this.content, objectenter, enter_preset)
				this.eventManagerDict[objectenter] = name

				name = this.eventManager.addEvent(this.content, objectleave, leave_preset)
				this.eventManagerDict[objectleave] = name
				}

				//start

				forHoverable()
			}
			else if (window.matchMedia('(hover: none)').matches) {
				objectenter = 'touchstart'
				objectleave = 'touchend'

				let forUnHoverable = () =>	{

					let press_preset = (event) => {
						console.log('Нажали')
						this.TouchTracker.startEvents()

						let interval_preset = () => { 
							console.log('this.intervalMainId')
							let {x, y} = this.TouchTracker.getPos()

							//console.log(this.curPos, x)
                            if (this.curPos == null){
                            	//console.log(`curPos будет равен ${x}`)
                            	this.curPos = x
                            	//console.log(this.curPos)
                            }

                            else{
                                //console.log(`result[0] ${result[0]} - curPos ${this.curPos} = ${result[0] - this.curPos}`)

                                //console.log(`${x} - ${this.curPos}: ${x - this.curPos}`)
                                this.addToLeft(x - this.curPos)
                                this.curPos = x
                                } 
						}

						if (this.currentInterval === null){
								console.log('currentInterval === null')
								this.currentInterval = this.intervalManager.setInterval(interval_preset , 100)
						}//

					}
					name = this.eventManager.addEvent(this.content, objectenter, press_preset)
					this.eventManagerDict[objectenter] = name

					let unpress_preset = () => {
						this.TouchTracker.stopEvents()
						this.curPos = null
						this.intervalManager.clearSingleInterval(this.currentInterval)
						this.currentInterval = null//Удалить интервал
					}

					name = this.eventManager.addEvent(this.content, objectleave, unpress_preset)
					this.eventManagerDict[objectleave] = name
				}
			
				//start

				forUnHoverable()

			}

			
		}
		

}   
    




const NameManager = new NameCreator()
const eventManager = new EventManager(NameManager);
const intervalManager = new IntervalManager()

const content = document.querySelector('.slider-content');
const nested = document.querySelector('.nested');



MenuSlider = new Slider(content, nested, eventManager, intervalManager)


MenuSlider.start()







