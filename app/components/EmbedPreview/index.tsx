import { useMemo } from 'react';
import { Container } from '@ifrc-go/ui';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import useDebouncedValue from '#hooks/useDebouncedValue';
import { getSafeUrl } from '#utils/common';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    url: string | undefined | null;
    title?: string;
    placeholder?: string;
}

function EmbedPreview({
    className,
    url,
    title = 'Embed Preview',
    placeholder = 'Enter a valid embed link to see a live preview',
}: Props) {
    const debouncedUrl = useDebouncedValue(url, 500);
    const previewUrl = useMemo(() => getSafeUrl(debouncedUrl), [debouncedUrl]);

    return (
        <Container
            className={_cs(styles.previewSection, className)}
            heading={title}
            withHeaderBorder
            withBackground
            empty={isNotDefined(previewUrl)}
            emptyMessage={placeholder}
            withoutMessageIcon
        >
            {isDefined(previewUrl) && (
                <iframe
                    src={previewUrl}
                    title={title}
                    className={styles.previewIframe}
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    referrerPolicy="no-referrer"
                    allowFullScreen
                />
            )}
        </Container>
    );
}

export default EmbedPreview;
