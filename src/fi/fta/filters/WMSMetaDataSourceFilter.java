package fi.fta.filters;

import fi.fta.beans.MetaDataSource;
import fi.fta.beans.MetaData;

public class WMSMetaDataSourceFilter extends GenericFilter<MetaData>
{
	
	private MetaDataSource source;
	
	public WMSMetaDataSourceFilter(MetaDataSource source)
	{
		this.source = source;
	}
	
	@Override
	public boolean match(MetaData obj)
	{
		return source == null || (obj.getSource() != null && source == obj.getSource());
	}

}
