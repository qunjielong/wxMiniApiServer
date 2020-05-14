export const curry = (func: Function) => {
    const cache = (...args: any[]) => {
        if (args.length >= func.length) {
            return func(...args)
        } else {
            return (...rest: any[]) => {
                return cache(...args, ...rest)
            }
        }
    }
    return cache
};

