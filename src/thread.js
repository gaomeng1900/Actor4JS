
/**
 * @method createUrl
 * @param {Function} fn
 * @param {*} [options]
 * @return {String}
 */
const createUrl = (fn, ...options) => {

    if (typeof fn !== 'function') {
        // Ensure the passed parameter is actually a function.
        throw new Error('Freelancer: Passed parameter must be a function.')
    }

    // Map each of the passed options through the JSON stringify process.
    const params = options.map(JSON.stringify)

    // Transform the passed function into an IIFE and then create a blob.
    const blob = new Blob([`(${fn.toString()})(${params})`], { type: 'application/javascript' })

    // Create a URL from the aforementioned blob that handles the worker logic.
    return URL.createObjectURL(blob)

}


const createFromFunction = (...args) => {
    return new Worker(createUrl(...args))
}

const createFromURL = (url) => {
    return new Worker(url)
}

const createFromFactory = (factory) => {
    return factory()
}


export {
    createFromFunction,
    createFromURL,
    createFromFactory,
}
