import React, { useRef, useEffect } from 'react';
import { Modal, Carousel } from 'antd';
import { Icon } from './Icon';

export function MediaViewerModal({ open, onClose, media = [], initialIndex = 0 }) {
    const carouselRef = useRef(null);

    useEffect(() => {
        if (open && carouselRef.current) {
            // Go to initial index without animation
            carouselRef.current.goTo(initialIndex, true);
        }
    }, [open, initialIndex]);

    if (!open) return null;

    return (
        <Modal
            open={open}
            title="Media Viewer"
            footer={null}
            onCancel={onClose}
            width={1000}
            centered
            destroyOnClose
            closeIcon={<Icon name="close" className="text-gray-500 text-xl hover:text-gray-800" />}
            styles={{
                body: { padding: 0, backgroundColor: '#000', borderRadius: '0 0 8px 8px' },
                header: { marginBottom: 0 }
            }}
        >
            <div className="relative bg-black w-full" style={{ height: '70vh' }}>
                <Carousel
                    arrows
                    infinite={false}
                    ref={carouselRef}
                    className="w-full h-full"
                >
                    {media.map((mediaItem, index) => {
                        const isVideo = mediaItem.startsWith('data:video/') ||
                            mediaItem.toLowerCase().endsWith('.mp4') ||
                            mediaItem.toLowerCase().endsWith('.webm') ||
                            mediaItem.toLowerCase().endsWith('.mov');

                        const src = mediaItem.startsWith('data:') || mediaItem.startsWith('blob:') || mediaItem.startsWith('http')
                            ? mediaItem
                            : `${import.meta.env.VITE_API_URL}${mediaItem}`;

                        return (
                            <div key={index} className="flex items-center justify-center outline-none h-full bg-black">
                                <div className="flex h-[70vh] items-center justify-center w-full">
                                    {isVideo ? (
                                        <video
                                            src={src}
                                            controls
                                            autoPlay={index === initialIndex}
                                            className="max-w-full max-h-full object-contain"
                                            crossOrigin="anonymous"
                                        />
                                    ) : (
                                        <img
                                            src={src}
                                            alt={`Media ${index + 1}`}
                                            className="max-w-full max-h-full object-contain"
                                            crossOrigin="anonymous"
                                            draggable={false}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </Carousel>
            </div>
        </Modal>
    );
}
