async function lazyUpsert(className, filter, update) {
    const query = new Parse.Query(className);

    for (const key in filter) {
        query.equalTo(key, filter[key]);
    }

    const results = await query.find({ useMasterKey: true });

    if (results.length > 0) {
        for (var i = 0; i < results.length; i++) {
            for (const updateKey in update) {
                results[i].set(updateKey, update[updateKey]);
            }
        }

        return results;
    } else {
        const objectClass = Parse.Object.extend(className);
        const object = new objectClass();
        for (const updateKey in update) {
            object.set(updateKey, update[updateKey]);
        }

        return [object];
    }
}

async function upsert(className, filter, update) {
    const results = await lazyUpsert(className, filter, update);
    await Parse.Object.saveAll(results, { useMasterKey: true });
}

module.exports = {
    upsert
}