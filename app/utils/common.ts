import {
    isFalsyString,
    isNotDefined,
} from '@togglecorp/fujs';
import { nonFieldError } from '@togglecorp/toggle-form';
import type { CombinedError } from 'urql';

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

export function getErrorMessage(error: CombinedError | undefined) {
    return error?.graphQLErrors?.[0]?.message || errorMessage;
}

export function getReadableFileSize(bytes: number | null | undefined): string {
    if (!bytes || bytes <= 0) {
        return '0 B';
    }
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const exponent = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1,
    );
    const value = bytes / (1024 ** exponent);
    // Show one decimal place for KB and larger, none for bytes
    return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

export const ACCEPTED_REPORT_FILE_TYPES = '.pdf,.doc,.docx,.png,.jpg,.jpeg';
export const ACCEPTED_PMER_FILE_TYPES = '.docx,.pdf,.xls,.xlsx,.csv,.png';
export const ACCEPTED_IMAGE_TYPES = 'image/*';
export const ACCEPTED_IMPORT_FILE_TYPES = '.xlsx,.xlsm';
export const MAX_REPORT_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

function isFileAccepted(file: File, accept: string | undefined) {
    if (isNotDefined(accept)) {
        return true;
    }
    const fileType = file.type.toLowerCase();
    return accept.split(',').some((token) => {
        const type = token.trim().toLowerCase();
        if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type);
        }
        if (type.endsWith('/*')) {
            return fileType.startsWith(type.slice(0, -1));
        }
        return fileType === type;
    });
}

export function validateFile(file: File, maxSize: number, accept: string | undefined) {
    if (file.size === 0) {
        return 'File is empty';
    }
    if (file.size > maxSize) {
        return `File must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
    }
    if (!isFileAccepted(file, accept)) {
        return 'File type is not supported';
    }
    return undefined;
}

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
