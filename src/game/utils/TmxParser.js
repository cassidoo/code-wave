/**
 * Parse TMX (Tiled Map Editor) XML format
 */
export function parseTmx(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const mapEl = xmlDoc.querySelector('map');
    
    const map = {
        width: parseInt(mapEl.getAttribute('width')),
        height: parseInt(mapEl.getAttribute('height')),
        tilewidth: parseInt(mapEl.getAttribute('tilewidth')),
        tileheight: parseInt(mapEl.getAttribute('tileheight')),
        layers: [],
        objectGroups: []
    };
    
    // Parse tile layers
    const layerEls = xmlDoc.querySelectorAll('layer');
    layerEls.forEach(layerEl => {
        const dataEl = layerEl.querySelector('data');
        const csvData = dataEl.textContent.trim();
        const tiles = csvData.split(',').map(t => parseInt(t.trim()));
        
        map.layers.push({
            name: layerEl.getAttribute('name'),
            width: parseInt(layerEl.getAttribute('width')),
            height: parseInt(layerEl.getAttribute('height')),
            data: tiles
        });
    });
    
    // Parse object groups (letters, enemies, spawn point)
    const objectGroupEls = xmlDoc.querySelectorAll('objectgroup');
    objectGroupEls.forEach(groupEl => {
        const objects = [];
        const objectEls = groupEl.querySelectorAll('object');
        
        objectEls.forEach(objEl => {
            objects.push({
                id: parseInt(objEl.getAttribute('id')),
                name: objEl.getAttribute('name') || '',
                type: objEl.getAttribute('type') || '',
                gid: objEl.hasAttribute('gid') ? parseInt(objEl.getAttribute('gid')) : null,
                x: parseFloat(objEl.getAttribute('x')),
                y: parseFloat(objEl.getAttribute('y')),
                width: objEl.hasAttribute('width') ? parseFloat(objEl.getAttribute('width')) : 0,
                height: objEl.hasAttribute('height') ? parseFloat(objEl.getAttribute('height')) : 0
            });
        });
        
        map.objectGroups.push({
            name: groupEl.getAttribute('name'),
            objects: objects
        });
    });
    
    return map;
}

/**
 * Get a layer by name from parsed map data
 */
export function getLayer(mapData, layerName) {
    return mapData.layers.find(l => l.name === layerName);
}

/**
 * Get an object group by name from parsed map data
 */
export function getObjectGroup(mapData, groupName) {
    return mapData.objectGroups.find(g => g.name === groupName);
}

/**
 * Convert layer data to 2D array for easier tile access
 */
export function layerTo2D(layer) {
    const result = [];
    for (let y = 0; y < layer.height; y++) {
        const row = [];
        for (let x = 0; x < layer.width; x++) {
            row.push(layer.data[y * layer.width + x]);
        }
        result.push(row);
    }
    return result;
}

/**
 * Extract the letter character from a Letter object name (e.g., "Letter A" -> "A")
 */
export function extractLetterFromName(name) {
    const match = name.match(/Letter\s+(\w)/i);
    return match ? match[1].toUpperCase() : '';
}
