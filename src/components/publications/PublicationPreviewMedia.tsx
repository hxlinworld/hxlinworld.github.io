import Image from 'next/image';

function getPreviewType(preview: string) {
    const extension = preview.split('?')[0].split('#')[0].split('.').pop()?.toLowerCase();

    if (extension && ['mp4', 'webm', 'ogg'].includes(extension)) {
        return 'video';
    }

    if (extension === 'gif') {
        return 'gif';
    }

    return 'image';
}

export default function PublicationPreviewMedia({ preview, title }: { preview: string; title: string }) {
    const src = `/papers/${preview}`;
    const type = getPreviewType(preview);

    if (type === 'video') {
        return (
            <video
                className="h-full w-full object-cover"
                src={src}
                muted
                autoPlay
                loop
                playsInline
                preload="metadata"
                aria-label={title}
            />
        );
    }

    if (type === 'gif') {
        return (
            <Image
                src={src}
                alt={title}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        );
    }

    return (
        <Image
            src={src}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
    );
}
