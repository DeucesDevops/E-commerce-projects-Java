package com.shoeapp.product_service.config;

import com.shoeapp.product_service.model.Product;
import com.shoeapp.product_service.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;

    public DataInitializer(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        List<String> defaultSizes = List.of("7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12");

        // 1. Nike Air Max 90
        Product airMax90 = new Product();
        airMax90.setName("Nike Air Max 90");
        airMax90.setDescription("The Nike Air Max 90 stays true to its OG running roots with the iconic Waffle sole, stitched overlays, and classic TPU accents. Fresh colors give a modern look while Max Air cushioning adds comfort to your journey.");
        airMax90.setBrand("Nike");
        airMax90.setCategory("Sneakers");
        airMax90.setPrice(new BigDecimal("129.99"));
        airMax90.setImageUrl("/images/nike-air-max-90.jpg");
        airMax90.setSizes(defaultSizes);
        airMax90.setColors(List.of("White", "Black", "Red"));
        airMax90.setFeatured(true);

        // 2. Adidas Ultraboost 22
        Product ultraboost = new Product();
        ultraboost.setName("Adidas Ultraboost 22");
        ultraboost.setDescription("Experience incredible energy return with the Adidas Ultraboost 22. Featuring a BOOST midsole and Primeknit+ upper, this shoe delivers a responsive ride and adaptive fit for every run.");
        ultraboost.setBrand("Adidas");
        ultraboost.setCategory("Running");
        ultraboost.setPrice(new BigDecimal("179.99"));
        ultraboost.setImageUrl("/images/adidas-ultraboost-22.jpg");
        ultraboost.setSizes(defaultSizes);
        ultraboost.setColors(List.of("Core Black", "Cloud White", "Solar Red"));
        ultraboost.setFeatured(true);

        // 3. Nike Air Jordan 1 High
        Product jordan1 = new Product();
        jordan1.setName("Nike Air Jordan 1 High");
        jordan1.setDescription("The Air Jordan 1 High is the shoe that started it all. With its iconic Wings logo and premium leather construction, this sneaker transcends the court as a timeless streetwear essential.");
        jordan1.setBrand("Nike");
        jordan1.setCategory("Sneakers");
        jordan1.setPrice(new BigDecimal("169.99"));
        jordan1.setImageUrl("/images/nike-air-jordan-1-high.jpg");
        jordan1.setSizes(defaultSizes);
        jordan1.setColors(List.of("Chicago Red", "Black", "White", "Royal Blue"));
        jordan1.setFeatured(true);

        // 4. New Balance 574
        Product nb574 = new Product();
        nb574.setName("New Balance 574");
        nb574.setDescription("The New Balance 574 is a heritage classic that blends everyday comfort with retro style. Its ENCAP midsole technology delivers lasting cushioning and reliable support for all-day wear.");
        nb574.setBrand("New Balance");
        nb574.setCategory("Casual");
        nb574.setPrice(new BigDecimal("89.99"));
        nb574.setImageUrl("/images/new-balance-574.jpg");
        nb574.setSizes(defaultSizes);
        nb574.setColors(List.of("Grey", "Navy", "Burgundy"));
        nb574.setFeatured(false);

        // 5. Converse Chuck Taylor All Star
        Product chuckTaylor = new Product();
        chuckTaylor.setName("Converse Chuck Taylor All Star");
        chuckTaylor.setDescription("The Converse Chuck Taylor All Star is the definitive canvas sneaker with over a century of heritage. Lightweight and versatile, it pairs effortlessly with any look from casual to creative.");
        chuckTaylor.setBrand("Converse");
        chuckTaylor.setCategory("Canvas");
        chuckTaylor.setPrice(new BigDecimal("55.00"));
        chuckTaylor.setImageUrl("/images/converse-chuck-taylor-all-star.jpg");
        chuckTaylor.setSizes(defaultSizes);
        chuckTaylor.setColors(List.of("Black", "White", "Red", "Navy"));
        chuckTaylor.setFeatured(false);

        // 6. Timberland 6-Inch Premium Boot
        Product timberland = new Product();
        timberland.setName("Timberland 6-Inch Premium Boot");
        timberland.setDescription("The iconic Timberland 6-Inch Premium Boot features waterproof nubuck leather and sealed seams for all-weather protection. Its rugged lug outsole and padded collar provide durability and comfort on any terrain.");
        timberland.setBrand("Timberland");
        timberland.setCategory("Boots");
        timberland.setPrice(new BigDecimal("198.00"));
        timberland.setImageUrl("/images/timberland-6-inch-premium-boot.jpg");
        timberland.setSizes(defaultSizes);
        timberland.setColors(List.of("Wheat Nubuck", "Black Nubuck"));
        timberland.setFeatured(true);

        // 7. Vans Old Skool
        Product vansOldSkool = new Product();
        vansOldSkool.setName("Vans Old Skool");
        vansOldSkool.setDescription("The Vans Old Skool is a legendary skate shoe recognized by its signature side stripe and durable suede and canvas upper. Built with a vulcanized rubber waffle outsole for superior board feel and grip.");
        vansOldSkool.setBrand("Vans");
        vansOldSkool.setCategory("Skate");
        vansOldSkool.setPrice(new BigDecimal("69.99"));
        vansOldSkool.setImageUrl("/images/vans-old-skool.jpg");
        vansOldSkool.setSizes(defaultSizes);
        vansOldSkool.setColors(List.of("Black/White", "Navy", "Checkerboard"));
        vansOldSkool.setFeatured(false);

        // 8. Puma RS-X
        Product pumaRsx = new Product();
        pumaRsx.setName("Puma RS-X");
        pumaRsx.setDescription("The Puma RS-X reinvents the classic running system with bold design and chunky proportions. Its RS cushioning technology provides exceptional comfort, making it a standout in the modern sneaker scene.");
        pumaRsx.setBrand("Puma");
        pumaRsx.setCategory("Sneakers");
        pumaRsx.setPrice(new BigDecimal("109.99"));
        pumaRsx.setImageUrl("/images/puma-rs-x.jpg");
        pumaRsx.setSizes(defaultSizes);
        pumaRsx.setColors(List.of("White", "Black", "Blue"));
        pumaRsx.setFeatured(false);

        // 9. Reebok Classic Leather
        Product reebokClassic = new Product();
        reebokClassic.setName("Reebok Classic Leather");
        reebokClassic.setDescription("The Reebok Classic Leather delivers timeless retro style with a soft garment leather upper and die-cut EVA midsole. Originally built for performance running, it has become an enduring everyday icon.");
        reebokClassic.setBrand("Reebok");
        reebokClassic.setCategory("Retro");
        reebokClassic.setPrice(new BigDecimal("84.99"));
        reebokClassic.setImageUrl("/images/reebok-classic-leather.jpg");
        reebokClassic.setSizes(defaultSizes);
        reebokClassic.setColors(List.of("White", "Black", "Grey"));
        reebokClassic.setFeatured(false);

        // 10. Dr. Martens 1460
        Product drMartens = new Product();
        drMartens.setName("Dr. Martens 1460");
        drMartens.setDescription("The Dr. Martens 1460 is the original 8-eye boot built with smooth Amarillo leather and the signature air-cushioned AirWair sole. A rebellious icon of self-expression since 1960.");
        drMartens.setBrand("Dr. Martens");
        drMartens.setCategory("Boots");
        drMartens.setPrice(new BigDecimal("169.99"));
        drMartens.setImageUrl("/images/dr-martens-1460.jpg");
        drMartens.setSizes(defaultSizes);
        drMartens.setColors(List.of("Black Smooth", "Cherry Red", "White"));
        drMartens.setFeatured(false);

        // 11. Nike Dunk Low
        Product dunkLow = new Product();
        dunkLow.setName("Nike Dunk Low");
        dunkLow.setDescription("Created for the hardwood but taken to the streets, the Nike Dunk Low delivers crisp overlays and classic hoops style. Its padded low-cut collar and foam midsole provide all-day comfort.");
        dunkLow.setBrand("Nike");
        dunkLow.setCategory("Sneakers");
        dunkLow.setPrice(new BigDecimal("109.99"));
        dunkLow.setImageUrl("/images/nike-dunk-low.jpg");
        dunkLow.setSizes(defaultSizes);
        dunkLow.setColors(List.of("Panda Black/White", "Grey Fog", "University Red"));
        dunkLow.setFeatured(true);

        // 12. Adidas Stan Smith
        Product stanSmith = new Product();
        stanSmith.setName("Adidas Stan Smith");
        stanSmith.setDescription("The Adidas Stan Smith is the clean and classic tennis shoe that has become a global streetwear staple. Its minimalist leather upper and perforated 3-Stripes deliver understated elegance for any occasion.");
        stanSmith.setBrand("Adidas");
        stanSmith.setCategory("Tennis");
        stanSmith.setPrice(new BigDecimal("99.99"));
        stanSmith.setImageUrl("/images/adidas-stan-smith.jpg");
        stanSmith.setSizes(defaultSizes);
        stanSmith.setColors(List.of("White/Green", "White/Navy", "White/Red"));
        stanSmith.setFeatured(false);

        productRepository.saveAll(List.of(
                airMax90, ultraboost, jordan1, nb574, chuckTaylor, timberland,
                vansOldSkool, pumaRsx, reebokClassic, drMartens, dunkLow, stanSmith
        ));

        System.out.println("Seeded " + productRepository.count() + " products into the database.");
    }
}
