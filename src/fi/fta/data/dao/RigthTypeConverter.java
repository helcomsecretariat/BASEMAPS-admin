package fi.fta.data.dao;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

import fi.fta.beans.RightType;

@Converter
public class RigthTypeConverter implements AttributeConverter<Set<RightType>, String>
{
	
	@Override
	public String convertToDatabaseColumn(Set<RightType> attribute)
	{
		StringBuilder sb = new StringBuilder();
		if (attribute != null && !attribute.isEmpty())
		{
			for (RightType rt : attribute)
			{
				sb.append(rt.name());
			}
		}
		return sb.toString();
	}
	
	@Override
	public Set<RightType> convertToEntityAttribute(String dbData)
	{
		if (dbData != null)
		{
			Set<RightType> ret = new HashSet<>();
			for (RightType rt : RightType.values())
			{
				if (dbData.indexOf(rt.name()) >= 0)
				{
					ret.add(rt);
				}
			}
			return ret;
		}
		return null;
	}
	
}
