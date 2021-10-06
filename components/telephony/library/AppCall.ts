import {Connection, Device} from "twilio-client";
import {AppCallEvents} from "./AppCallEvents";
import {booleanCallback, callback, connectCallback, DeviceType, phoneDataType,} from "./AppCallTypes";

declare const window: {
    number: string
    arrPhones: Array<phoneDataType>
    is_admin: boolean
}


type constructor = {
    setConnect: connectCallback,
    connect: Connection | null,
    setIsConnect?: booleanCallback,

    // При ответе на звонок (сбрасываются кнопки, зелёная недоступно, красная доступна)
    connectHandler?: callback

    // Сброс вызова
    disconnectHandler?: callback

    // При входящем (мелькает зеленая, красная доступно)
    incomingHandler?: connectCallback

    // Взял трубку (зеленая на недоступно, изменил статус, мегание останавливается)
    acceptHandler?: connectCallback

    // Начинаю звонить (зеленая недоступно, красная доступна, изменил статус)
    callingHandler?: callback

    // Входящий звонок (уведомление, колокольчик)
    missedCallHandler?: connectCallback

    // Calling (звоню), ready (при старте dic. handler), In call with (с кем то говорит (connect.parameters.From)), Incoming (входящий вызов)

}

export class AppCallFn extends AppCallEvents {
    //@ts-ignore
    private Device: DeviceType = Device;
    private connect: Connection | null
    private connectHandler: callback | undefined
    private disconnectHandler: callback | undefined
    private incomingHandler: connectCallback | undefined
    private acceptHandler: connectCallback | undefined
    private callingHandler: callback | undefined
    private missedCallHandler: connectCallback | undefined

    constructor({
                    setConnect, connect, setIsConnect,
                    connectHandler, disconnectHandler, incomingHandler, acceptHandler, callingHandler, missedCallHandler
                }: constructor) {

        //@ts-ignore
        super({Device: Device, setConnect, setIsConnect})

        this.connect = connect                                          // connect instance
        this.connectHandler = connectHandler                            // Connect handler
        this.disconnectHandler = disconnectHandler                      // disconnect handler
        this.incomingHandler = incomingHandler                          // incoming call handler
        this.acceptHandler = acceptHandler                              // accept call handler
        this.callingHandler = callingHandler                            // calling handler
        this.missedCallHandler = missedCallHandler
    }


    private _connectHandler() {
        this.connectHandler && this.connectHandler()
    }

    private _disconnectHandler() {
        this.disconnectHandler && this.disconnectHandler()
    }

    private _acceptHandler(connect: Connection) {
        this.acceptHandler && this.acceptHandler(connect)
    }

    private _callingHandler() {
        this.callingHandler && this.callingHandler()
    }

    private _incomingHandler(connect: Connection) {
        this.incomingHandler && this.incomingHandler(connect)
    }

    private _missedCallHandler(connect:Connection) {
        this.missedCallHandler && this.missedCallHandler(connect)
    }


    public sendNumber(number: string) {
        //@ts-ignore
        this.Device.activeConnection()?.sendDigits(number)
        console.log(this.Device.activeConnection())
        // this.connect?.sendDigits(number)
    }

    // pressing btn  Decline => HungUp or Reject
    public HungUp() {
        this._disconnectHandler()
        // if in call with => hangUp
        if (AppCallFn.connectGuard(this.connect, 'open')) {
            this.Device.disconnectAll()

            // if incoming call => reject
        } else {
            if (AppCallFn.connectGuard(this.connect, 'pending')) {
                this.connect?.reject()
                console.log('reject')
            }
        }
    }

    // pressing btn Accept => Accept or Calling
    public Call(cellPhoneInput: string, fromNumber: string) {
        let params = {
            'phoneNumber': cellPhoneInput,
            'from': fromNumber
        }
        // if incoming call
        if (this.connect && AppCallFn.connectGuard(this.connect, 'pending')) {
            this._connectHandler()
            this.connect.accept()
            this._acceptHandler(this.connect)
            // if calling to number
        } else if (this.Device.status() === 'ready' || AppCallFn.connectGuard(this.connect, 'closed')) {
            this.Device.connect(params)
            this._callingHandler()
            this._connectHandler()
        }
    }

    // token init
    async initToken(number: string) {
        const {token} = await fetch(`https://sms.green-node.ru/token/generate/cnu/${number}`)          // "url": "https://sms.altekloads.com",
            .then((res) => res.json())
            .catch((error) => console.log(error))

        if (token) {
            console.log(token)
            this.Device.setup(token, {
                debug: true,
                sounds: {
                    incoming: 'https://sms.green-node.ru/incoming_sound'
                }
            })
        } else {
            console.log('Token error')
        }
    }

    public static connectGuard(value: any,status:string) {
      if (value.__proto__.hasOwnProperty('status') && typeof value.status === 'function' && value.status() === status) {
        return true;
      }
      return false;
    }

    public updateConnect(connect: Connection) {
      this.connect = connect
    }

  initEventsListener() {
        // Add Events listener
        super.initEventsHandler(this._disconnectHandler, this._incomingHandler, this._missedCallHandler)
    }
}


