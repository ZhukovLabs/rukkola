import {connectToDatabase} from '@/lib/mongoose'
import {Category} from '@/models/category'
import CategoriesTable from './categories-table'
import {AddCategoryButton} from './add-category-button'
import {AddCategoryDialog} from './add-category-modal'

export const DashboardCategoriesPage = async () => {
    await connectToDatabase()
    const categories = await Category.find().sort({order: 1}).lean()

    const cats = JSON.parse(JSON.stringify(categories));

    return (
        <>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                <h1 style={{fontSize: '1.5rem', fontWeight: 'bold'}}>Управление категориями</h1>
                <AddCategoryButton/>
            </div>

            <CategoriesTable categories={cats}/>
            <AddCategoryDialog categories={cats}/>
        </>
    )
}
