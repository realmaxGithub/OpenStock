'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import InputField from '@/components/forms/InputField';
import FooterLink from '@/components/forms/FooterLink';
import { signInWithEmail } from "@/lib/actions/auth.actions";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from 'next-intl';
import OpenDevSocietyBranding from "@/components/OpenDevSocietyBranding";
import React from "react";

const SignIn = () => {
    const router = useRouter();
    const t = useTranslations('auth');
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onBlur',
    });

    const onSubmit = async (data: SignInFormData) => {
        try {
					const result = await signInWithEmail(data);
					console.log("Sign in result...", result);
            if (result.success) {
                router.push('/');
                return;
            }
            toast.error(t('signInFailed'), {
                description: result.error ?? t('invalidCredentials'),
            });
        } catch (e) {
            console.error(e);
            toast.error(t('signInFailed'), {
                description: e instanceof Error ? e.message : t('signInFailed'),
            });
        }
    }

    return (
        <>
            <h1 className="form-title">{t('welcomeBack')}</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="email"
                    label={t('email')}
                    placeholder="opendevsociety@cc.cc"
                    register={register}
                    error={errors.email}
                    validation={{
                        required: t('emailRequired'),
                        pattern: {
                            value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/,
                            message: t('validEmail')
                        }
                    }}
                />

                <InputField
                    name="password"
                    label={t('password')}
                    placeholder={t('enterPassword')}
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{ required: t('passwordRequired'), minLength: 8 }}
                />

                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? t('signingIn') : t('signIn')}
                </Button>

                <FooterLink text={t('dontHaveAccount')} linkText={t('createAccount')} href="/sign-up" />
                <OpenDevSocietyBranding outerClassName="mt-10 flex justify-center" />
                <div className="mt-5 flex justify-center">
                    <a href="https://peerlist.io/ravixalgorithm/project/openstock" target="_blank" rel="noreferrer">
                        <img
                            src="https://peerlist.io/api/v1/projects/embed/PRJH8OED7MBL9MGB9HRMKAKLM66KNN?showUpvote=true&theme=light"
                            alt="OpenStock"
                            style={{ width: 'auto', height: '72px' }}
                        />
                    </a>
                </div>
            </form>
        </>
    );
};
export default SignIn;
