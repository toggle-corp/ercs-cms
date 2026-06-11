export function labelSelector<T>(item: { label: T }) {
    return item.label;
}

export function keySelector<T>(item: { key: T }) {
    return item.key;
}

export function idSelector<T>(item: { id: T }) {
    return item.id;
}

export function nameSelector<T>(item: { name: T }) {
    return item.name;
}

export function valueSelector<T>(item: { value: T }) {
    return item.value;
}

// Boolean values for RadioInput (used in forms)
export const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
];

// String values for SelectInput (used in filter)
export const statusFilterOptions = [
    { label: 'Active', value: 'true' },
    { label: 'Inactive', value: 'false' },
];

export const errorMessage = 'Something went wrong. Please try again. ';
