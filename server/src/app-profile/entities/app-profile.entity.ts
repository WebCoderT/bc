import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'app_profile' })
export class AppProfileEntity {
  @PrimaryColumn({ name: 'id', type: 'int' })
  id!: number;

  @Column({ name: 'app_name', type: 'varchar', length: 120 })
  appName!: string;

  @Column({ name: 'app_wordmark', type: 'varchar', length: 120 })
  appWordmark!: string;

  @Column({ name: 'logo_text', type: 'varchar', length: 20 })
  logoText!: string;

  @Column({ name: 'description', type: 'varchar', length: 255 })
  description!: string;

  @Column({ name: 'official_site_label', type: 'varchar', length: 120 })
  officialSiteLabel!: string;

  @Column({ name: 'default_organization_name', type: 'varchar', length: 120 })
  defaultOrganizationName!: string;

  @Column({ name: 'default_email_domain', type: 'varchar', length: 120 })
  defaultEmailDomain!: string;

  @Column({ name: 'default_user_avatar', type: 'text' })
  defaultUserAvatar!: string;

  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @Column({
    name: 'updated_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
