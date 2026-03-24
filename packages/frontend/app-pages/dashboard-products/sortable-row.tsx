'use client';

import {useSortable} from '@dnd-kit/sortable';
import {GripVertical} from 'lucide-react';
import {IconButton, Table} from '@chakra-ui/react';
import type {ReactNode} from 'react';

type SortableRowProps = {
    id: string;
    children: ReactNode;
};

export function SortableRow({id, children}: SortableRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({id});

    const style = {
        transform: transform ? `translateY(${transform.y}px)` : undefined,
        transition,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <Table.Row
            ref={setNodeRef}
            style={style}
            bg={isDragging ? 'gray.700' : 'gray.900'}
            borderBottom="1px solid"
            borderColor="gray.800"
            _hover={{bg: isDragging ? 'gray.700' : 'gray.800', transition: '0.2s ease'}}
        >
            <Table.Cell p={2} w="40px">
                <IconButton
                    aria-label="Перетащить"
                    size="sm"
                    variant="ghost"
                    cursor={isDragging ? 'grabbing' : 'grab'}
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical size={16}/>
                </IconButton>
            </Table.Cell>
            {children}
        </Table.Row>
    );
}