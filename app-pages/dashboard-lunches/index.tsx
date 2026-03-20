import {getAllLunches} from './actions'
import {LunchGallery} from './lunch-gallery'

type LunchData = {
    _id: string
    image: string
    active: boolean
}

export const LunchDashboardPage = async () => {
    const result = await getAllLunches()
    
    if (!result.success || !result.data) {
        return <LunchGallery initialLunches={[]} />
    }

    const lunches: LunchData[] = result.data.map(l => ({
        _id: typeof l._id === 'string' ? l._id : l._id.toString(),
        image: l.image,
        active: l.active
    }))

    return <LunchGallery initialLunches={lunches} />
}
