package fi.fta.utils;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonUtils
{
	
	private final static ObjectMapper _OBJECT_MAPPER = new ObjectMapper();

    private JsonUtils(){
    }

    public static String toJson(Object obj) {
        String result = null;
        try {
            result = _OBJECT_MAPPER.writeValueAsString(obj);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return result;
    }

    public static <T> T toObject(String json, Class<T> clazz) {
        T result = null;
        try {
            result = _OBJECT_MAPPER.readValue(json, clazz);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return result;
    }

    public static Map<String,Object> toMap(String json) {
        Map<String,Object> result = null;
        try {
            result = _OBJECT_MAPPER.readValue(json,
                    new TypeReference<HashMap<String, Object>>() {});
        } catch (IOException e) {
            e.printStackTrace();
        }
        return result;
    }

    public static <T> T toTypeReference(String json, TypeReference<T> typeReference) {
        T result = null;
        try {
            result = _OBJECT_MAPPER.readValue(json, typeReference);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return result;
    }
	
}
