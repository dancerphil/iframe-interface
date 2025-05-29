const randomId = () => Math.random().toString(36).slice(2);

interface Options {
    side: 'host' | 'guest';
    targetOrigin?: string;
}

interface MessageData {
    meta: 'iframe-interface';
    type: 'request' | 'resolve' | 'reject';
    name: string;
    id: string;
    payload: any;
}

export const createFactory = (options: Options) => {
    const oppositeWindowRef = {
        current: options.side === 'guest' ? window.parent : null,
    };

    const setIframe = (iframe: HTMLIFrameElement) => {
        if (iframe?.contentWindow) {
            oppositeWindowRef.current = iframe.contentWindow;
        }
    };

    const promiseResolverMap = new Map<string, {
        resolve: (result: any) => void;
        reject: (error: Error) => void;
    }>();

    const registryMap = new Map<string, (params: any) => any>();

    const registerCallHandler = (name: string, handler: (params: any) => any) => {
        registryMap.set(name, handler);
    };

    const oppositeWindowPostMessage = (message: MessageData) => {
        oppositeWindowRef.current?.postMessage(
            message,
            {targetOrigin: options.targetOrigin},
        );
    };

    const requestHandler = async (data: MessageData) => {
        const {name, id, payload} = data;

        const resolve = (result: any) => {
            oppositeWindowPostMessage({
                meta: 'iframe-interface',
                type: 'resolve',
                name,
                id,
                payload: result,
            });
        };
        const reject = (error: Error) => {
            oppositeWindowPostMessage({
                meta: 'iframe-interface',
                type: 'reject',
                name,
                id,
                payload: error,
            });
        };
        const handler = registryMap.get(name);
        if (!handler) {
            reject(new Error(`No handler found for ${name}`));
            return;
        }
        try {
            const result = await handler(payload);
            resolve(result);
        }
        catch (e) {
            reject(e as Error);
        }
    };

    const createCall = <TParams = void, T = unknown>(name: string) => {
        const call = (params: TParams): Promise<T> => {
            return new Promise((resolve, reject) => {
                const id = `${name}-${randomId()}-${Date.now()}`;
                promiseResolverMap.set(id, {
                    resolve,
                    reject,
                });
                oppositeWindowPostMessage({
                    meta: 'iframe-interface',
                    type: 'request',
                    name,
                    id,
                    payload: params,
                });
            });
        };
        return call;
    };

    window.addEventListener('message', (event: MessageEvent<MessageData>) => {
        const {data} = event;
        if (typeof data !== 'object' || data === null) {
            return;
        }
        if (data.meta !== 'iframe-interface') {
            return;
        }
        const {type} = data;

        if (type === 'request') {
            requestHandler(data);
            return;
        }
        if (type === 'resolve' || type === 'reject') {
            const {id, payload} = data;
            const resolver = promiseResolverMap.get(id);
            if (!resolver) {
                return;
            }
            resolver[type](payload);
            promiseResolverMap.delete(id);
        }
    });

    return {
        setIframe,
        registerCallHandler,
        createCall,
    };
};
