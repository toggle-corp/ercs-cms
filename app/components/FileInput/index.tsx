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
import { isDefined } from '@togglecorp/fujs';
import { type Error } from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import {
    ACCEPTED_REPORT_FILE_TYPES,
    MAX_REPORT_FILE_SIZE,
    validateFile,
} from '#utils/common';

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
