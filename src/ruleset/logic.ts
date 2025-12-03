import { Entity, PrimaryGeneratedColumn, Column, VersionColumn, Unique, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';

@Entity()
@Unique(['name_of_ruleset'])
export class BusinessLogic {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name_of_ruleset: string;

    @VersionColumn()
    version: number;

    @Column('simple-json')
    rules: any[];

    @Column({ default: true })
    is_enabled: boolean; 

    @CreateDateColumn({ type: 'datetime' })
    created_at: Date;

    @UpdateDateColumn({ type: 'datetime' })
    updated_at: Date;

    @BeforeInsert()
    setCreationDate() {
        const now = new Date();
        this.created_at = now;
        this.updated_at = now;
        }

    @BeforeUpdate()
    setUpdateDate() {
        this.updated_at = new Date();
        }

    }   

