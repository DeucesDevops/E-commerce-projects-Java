package com.shoeapp.user_service.service;

import com.shoeapp.user_service.model.Address;
import com.shoeapp.user_service.model.UserProfile;
import com.shoeapp.user_service.repository.AddressRepository;
import com.shoeapp.user_service.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class UserService {

    private final UserProfileRepository profileRepository;
    private final AddressRepository addressRepository;

    public UserService(UserProfileRepository profileRepository,
                       AddressRepository addressRepository) {
        this.profileRepository = profileRepository;
        this.addressRepository = addressRepository;
    }

    public UserProfile getOrCreateProfile(Long userId, String email, String name) {
        return profileRepository.findByUserId(userId).orElseGet(() -> {
            // First time this user visits their profile — create it
            UserProfile profile = new UserProfile();
            profile.setUserId(userId);
            profile.setEmail(email);
            profile.setName(name);
            return profileRepository.save(profile);
        });
    }

    public UserProfile updateProfile(Long userId, Map<String, String> updates) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        if (updates.containsKey("name")) profile.setName(updates.get("name"));
        if (updates.containsKey("phone")) profile.setPhone(updates.get("phone"));
        if (updates.containsKey("avatarUrl")) profile.setAvatarUrl(updates.get("avatarUrl"));
        return profileRepository.save(profile);
    }

    public List<Address> getAddresses(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    public Address addAddress(Long userId, Address address) {
        address.setUserId(userId);
        return addressRepository.save(address);
    }

    public Address updateAddress(Long userId, Long addressId, Address updated) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        if (!address.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }
        address.setLabel(updated.getLabel());
        address.setStreet(updated.getStreet());
        address.setCity(updated.getCity());
        address.setState(updated.getState());
        address.setZip(updated.getZip());
        address.setCountry(updated.getCountry());
        address.setDefault(updated.isDefault());
        return addressRepository.save(address);
    }

    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        if (!address.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }
        addressRepository.delete(address);
    }
}
