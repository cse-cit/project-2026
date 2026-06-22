package com.syncforge.project;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProjectRepository extends MongoRepository<Project, String> {

    // Projects created by the user
    List<Project> findByOwnerId(String ownerId);

    // Projects where the user is a member
    List<Project> findByMembersUserId(String userId);

    // Projects where user is either owner or member
    List<Project> findByOwnerIdOrMembersUserId(String ownerId, String userId);

    // Dashboard count → projects where user is owner
    long countByOwnerId(String ownerId);

    // Dashboard count → projects where user is a member
    long countByMembersUserId(String userId);

    // Dashboard count → owner OR member
    long countByOwnerIdOrMembersUserId(String ownerId, String userId);

}