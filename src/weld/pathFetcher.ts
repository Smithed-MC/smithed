
const arrayMatcher = /[A-Za-z]+(\[([A-Za-z0-9]+)?\])+/
class PathFetcher {
    static getDataFromPath(data:{}, path: string): {}|null {
        let segments = path.split('.');

        if(segments.length > 0)
            return this.fetchNext(data, 0, segments)

        return null;
    }

    static atDataFromPath(data:{}, path: string, complete: (data: {}) => void) {
        let segments = path.split('.');

        if(segments.length > 0)
            this.atNext(data, 0, segments, complete)
    }


    private static fetchNext(data:{[key:string]:any}, index: number, segments: string[]):{}|null {
        // Determine if the current path segment is trying to index an array
        segments = PathFetcher.ifArrayPath(segments, index);

        // Return the current data if we have reached the end
        if(index >= segments.length - 1) {
            return data[segments[index]]
        } else {
            // If we are still at a valid path
            if(data[segments[index]] != null) {
                // Continue the search
                return PathFetcher.fetchNext(data[segments[index]], index + 1, segments);
            } else {
                return null;
            }
        }
    }

    private static atNext(data:{[key:string]:any}, index: number, segments: string[], complete: (data: {}) => void) {
        // Determine if the current path segment is trying to index an array
        segments = PathFetcher.ifArrayPath(segments, index);

        // Setup path
        if(data[segments[index]] == null) {
            data[segments[index]] = []
        }

        if(index >= segments.length - 1) {
            complete(data[segments[index]]);
        } else {
            PathFetcher.atNext(data[segments[index]], index + 1, segments, complete);
        }
    }

    private static ifArrayPath(segments: string[], index: number) {
        if (segments[index] != null && segments[index].match(arrayMatcher)) {
            let subSegments = segments[index].split('[');
            segments[index] = subSegments[0];
            // Insert the new indices into the segments array
            for (let i = 1; i < subSegments.length; i++) {
                segments.splice(index + 1, 0, subSegments[i].substring(0, subSegments[i].length - 1));
            }
        }

        return segments;
    }
}

export default PathFetcher