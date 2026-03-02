package com.shoeapp.cart_service.model;

/**
 * One item in a user's shopping cart.
 * This is NOT a database entity — it's stored as JSON in Redis.
 */
public class CartItem {

    private Long productId;
    private String name;
    private String brand;
    private String size;
    private String color;
    private double price;
    private int quantity;
    private String imageUrl;

    public CartItem() {}

    public CartItem(Long productId, String name, String brand, String size,
                    String color, double price, int quantity, String imageUrl) {
        this.productId = productId;
        this.name = name;
        this.brand = brand;
        this.size = size;
        this.color = color;
        this.price = price;
        this.quantity = quantity;
        this.imageUrl = imageUrl;
    }

    // Getters and setters

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
