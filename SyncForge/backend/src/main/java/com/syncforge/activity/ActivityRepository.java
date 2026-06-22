package com.syncforge.activity;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ActivityRepository extends MongoRepository<Activity, String> {

    List<Activity> findTop10ByOrderByCreatedAtDesc();

}