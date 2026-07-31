import {
    useCallback,
    useState,
} from 'react';
import {
    Description,
    InlineLayout,
    ListView,
    RawFileInput,
} from '@ifrc-go/ui';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { type Error } from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';

const ACCEPTED_REPORT_FILE_TYPES = '.pdf,.doc,.docx,.png,.jpg,.jpeg';
const MAX_REPORT_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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

function validateFile(file: File, maxSize: number, accept: string | undefined) {
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

interface Props<N, T> {
    name: N;
    fileName?: string;
    onChange: (file: File | undefined, name: N) => void;
    error?: Error<T>;
    accept?: string;
    disabled?: boolean;
    placeholder?: string;
    maxSize?: number;
}

function FileInput<N, T>(props: Props<N, T>) {
    const {
        name,
        fileName,
        onChange,
        error,
        accept = ACCEPTED_REPORT_FILE_TYPES,
        disabled,
        placeholder = 'Please upload a file',
        maxSize = MAX_REPORT_FILE_SIZE,
    } = props;

    const [validationError, setValidationError] = useState<string>();

    const handleChange = useCallback(
        (file: File | undefined, inputName: N) => {
            const message = isDefined(file)
                ? validateFile(file, maxSize, accept)
                : undefined;
            setValidationError(message);
            onChange(isDefined(message) ? undefined : file, inputName);
        },
        [onChange, maxSize, accept],
    );

    return (
        <ListView layout="block">
            <InlineLayout
                spacing="sm"
                contentAlignment="center"
                before={(
                    <RawFileInput
                        name={name}
                        onChange={handleChange}
                        accept={accept}
                        disabled={disabled}
                        styleVariant="outline"
                    >
                        {isDefined(fileName) ? 'Change file' : 'Upload file'}
                    </RawFileInput>
                )}
            >
                <Description>
                    {isDefined(fileName) ? fileName : placeholder}
                </Description>
            </InlineLayout>
            <NonFieldError error={validationError ?? error} />
        </ListView>
    );
}

export default FileInput;
