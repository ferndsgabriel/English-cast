function formatName(name) {
        name = name.replace(/\s+/g, '');
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
export {formatName};