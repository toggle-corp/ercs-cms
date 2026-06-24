import { isFalsyString } from '@togglecorp/fujs';
import { nonFieldError } from '@togglecorp/toggle-form';

import type { AdminAreaLevel } from '#generated/types/graphql';

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

export function omitKeys<T extends object, K extends keyof T>(
    obj: T,
    keys: readonly K[],
): Omit<T, K> {
    const result = { ...obj };
    keys.forEach((key) => { delete result[key]; });
    return result;
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

interface ServerError {
    field: string;
    messages: string | null;
    objectErrors?: ServerError[] | null;
    arrayErrors?: unknown[] | null;
}

export function transformToFormError(
    serverErrors: ServerError[],
): Record<string | symbol, unknown> {
    return serverErrors.reduce(
        (acc, { field, messages, objectErrors }) => {
            if (field === 'nonFieldErrors') {
                return { ...acc, [nonFieldError]: messages ?? '' };
            }
            if (objectErrors?.length) {
                return { ...acc, [field]: transformToFormError(objectErrors) };
            }
            return { ...acc, [field]: messages ?? '' };
        },
        {} as Record<string | symbol, unknown>,
    );
}

export type REGION_LEVEL = AdminAreaLevel.Region;
export type ZONE_LEVEL = AdminAreaLevel.Zone;
export type WOREDA_LEVEL = AdminAreaLevel.Woreda;

const SAFE_URL_PROTOCOLS = ['http:', 'https:'];

export function getSafeUrl(value: string | null | undefined): string | undefined {
    if (isFalsyString(value)) {
        return undefined;
    }
    try {
        const parsed = new URL(value);
        if (!SAFE_URL_PROTOCOLS.includes(parsed.protocol)) {
            return undefined;
        }
        if (typeof window !== 'undefined' && parsed.origin === window.location.origin) {
            return undefined;
        }
        return parsed.href;
    } catch {
        return undefined;
    }
}

export function safeUrlCondition(value: string | null | undefined) {
    if (isFalsyString(value)) {
        return undefined;
    }
    return getSafeUrl(value)
        ? undefined
        : 'Enter a valid URL starting with http:// or https://';
}
