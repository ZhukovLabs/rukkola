'use client';

import {useEffect, useState} from 'react';
import {LunchGallery} from './lunch-gallery';
import {getAllLunches, type LunchItem} from '@/lib/api/lunches';
import {Box, Spinner, Center} from '@chakra-ui/react';

type LunchData = {
    _id: string;
    image: string;
    active: boolean;
};

export const LunchDashboardPage = () => {
    const [lunches, setLunches] = useState<LunchData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLunches = async () => {
            try {
                const result = await getAllLunches();
                if (result.success && result.data) {
                    const mapped: LunchData[] = result.data.map((l: LunchItem) => ({
                        _id: l._id,
                        image: l.image,
                        active: l.active,
                    }));
                    setLunches(mapped);
                }
            } catch (error) {
                console.error('Failed to fetch lunches:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLunches();
    }, []);

    if (loading) {
        return (
            <Center minH="200px">
                <Spinner size="xl" color="teal.300"/>
            </Center>
        );
    }

    return <LunchGallery initialLunches={lunches}/>;
};
