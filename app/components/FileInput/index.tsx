import { useCallback } from 'react';
import {
    Description,
    InlineLayout,
    RawFileInput,
} from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';
import { type Error } from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import useAlert from '#hooks/useAlert';

interface Props<N, T> {
    name: N;
    fileName?: string;
    onChange: (file: File | undefined, name: N) => void;
    error?: Error<T>;
    maxSize?: number;
    accept?: string;
    disabled?: boolean;
    placeholder?: string;
}

function FileInput<N, T>(props: Props<N, T>) {
    const {
        name,
        fileName,
        onChange,
        error,
        maxSize,
        accept,
        disabled,
        placeholder = 'Please upload a file',
    } = props;

    const alert = useAlert();

    const handleChange = useCallback(
        (file: File | undefined, inputName: N) => {
            if (isDefined(file) && isDefined(maxSize) && file.size > maxSize) {
                alert.show(
                    `File must be ${Math.round(maxSize / (1024 * 1024))}MB or smaller`,
                    { variant: 'danger' },
                );
                return;
            }
            onChange(file, inputName);
        },
        [alert, maxSize, onChange],
    );

    return (
        <>
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
            <NonFieldError error={error} />
        </>
    );
}

export default FileInput;
