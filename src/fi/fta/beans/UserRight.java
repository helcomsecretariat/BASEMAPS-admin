package fi.fta.beans;

import java.util.Date;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import fi.fta.beans.ui.UserRightUI;
import fi.fta.data.dao.RigthTypeConverter;
import fi.fta.utils.Util;

@Entity
@Table(name="user_rights")
public class UserRight extends IdBean
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 2260768498546558512L;

	@Column(name = "user_id", updatable = false, insertable = false)
	private Long userId;
	
	@Column(name = "category_id")
	private Long categoryId;
	
	@Convert(converter = RigthTypeConverter.class)
	private Set<RightType> rights;
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(insertable=false, updatable=false)
	protected Date created;
	
	
	public UserRight()
	{}
	
	public UserRight(UserRightUI ui)
	{
		super(ui.getId());
		this.setUserId(ui.getUserId());
		this.setCategoryId(ui.getCategoryId());
		this.setRights(ui.getRights());
	}
	
	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public Long getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(Long categoryId) {
		this.categoryId = categoryId;
	}

	public Set<RightType> getRights() {
		return rights;
	}

	public void setRights(Set<RightType> rights) {
		this.rights = rights;
	}

	public Date getCreated() {
		return created;
	}

	public void setCreated(Date created) {
		this.created = created;
	}

	@Override
    public int hashCode()
    {
    	return super.hashCode() +
    		7 * (categoryId == null ? super.hashCode() : categoryId.hashCode()) +
    		19 * (rights == null ? super.hashCode() : rights.hashCode());
    }
	
	@Override
	public boolean equals(Object o)
	{
		boolean equals = o != null && (o instanceof UserRight);
		if (equals)
		{
			UserRight ur = ((UserRight)o);
			equals = (this.id != null && ur.getId() != null && this.id.equals(ur.getId())) ||
				(this.userId != null && ur.getUserId() != null &&
				this.userId.equals(ur.getUserId()) &&
				Util.equalsWithNull(this.categoryId, ur.getCategoryId()) &&
				Util.equalsWithNull(this.rights, ur.getRights()));
		}
		return equals;
	}
	
}
