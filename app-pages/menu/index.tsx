import Image from "next/image";
import {Box} from "@chakra-ui/react";
import {Navbar} from "./navbar";
import {Products} from "./products";
import {Footer} from "./footer";
import {CartButton} from "./cart-button";
import {ScrollToFooterButton} from "@/components/scroll-footer-button";
import {ProductModal} from "@/components/product-modal";
import {connectToDatabase} from "@/lib/mongoose";
import {Category} from "@/models/category";
import {Lunch} from "@/models/lunch";
import {ActiveLunch} from "@/app-pages/menu/active-lunch";

import dynamic from "next/dynamic";

const CartModal = dynamic(() => import("./cart-modal").then(m => m.CartModal), {
    loading: () => null,
});


export const MenuPage = async () => {
    await connectToDatabase();

    const activeLunch = await Lunch.findOne({active: true}).lean();

    const categories = await Category.find({isMenuItem: true})
        .sort({order: 1})
        .lean();

    const navItems = categories
        .filter(({parent}) => !parent)
        .map(parent => ({
            id: parent._id.toString(),
            name: parent.name,
            children: categories
                .filter(category => (
                    category.parent?.toString() === parent._id.toString()
                ))
                .map(sub => ({
                    id: sub._id.toString(),
                    name: sub.name,
                })),
        }));

    return (
        <Box
            display="flex"
            flexDirection="column"
            maxW="1440px"
            w="100%"
            mx="auto"
            p="20px"
        >
            <Box
                mx="auto"
                w={{base: "80%", sm: "60%", md: "400px"}}
                maxW="90vw"
                mb={{base: 4, md: 6}}
            >
                <Image
                    src="/logo.svg"
                    alt="logo"
                    width={400}
                    height={200}
                    style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "contain",
                    }}
                    priority
                />
            </Box>

            {activeLunch && <ActiveLunch image={activeLunch.image}/>}

            <ScrollToFooterButton/>

            <Navbar items={navItems}/>

            <Products/>

            <CartButton/>
            <CartModal/>

            <Footer/>

            <ProductModal/>
        </Box>
    );
}
